/**
 * CDK construct for the Dispatch database migration Fargate task.
 *
 * The task is started by a CloudFormation custom resource during deployment. It then:
 *   1. Downloads the migration artifact from S3 into a shared task volume.
 *   2. Extracts Drizzle migration SQL files and their Node.js dependencies.
 *   3. Acquires a PostgreSQL advisory lock.
 *   4. Runs `drizzle-kit migrate` to apply any pending migrations.
 *   5. Releases the advisory lock.
 *
 * The custom resource polls ECS until the task stops. A non-zero migration container exit code
 * fails the CloudFormation deployment, so Riff-Raff cannot update the application Lambda.
 */

import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { CfnParameter, CustomResource, Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import {
	Cluster,
	ContainerDependencyCondition,
	ContainerImage,
	FargateTaskDefinition,
	LogDrivers,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

const migrationHandler = `
const {
	DescribeTasksCommand,
	ECSClient,
	RunTaskCommand,
	StopTaskCommand,
} = require('@aws-sdk/client-ecs');
const https = require('node:https');
const client = new ECSClient({});

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const sendResponse = (event, context, status, physicalResourceId, reason) => {
	const body = JSON.stringify({
		Status: status,
		Reason: reason || 'See CloudWatch logs: ' + context.logStreamName,
		PhysicalResourceId: physicalResourceId,
		StackId: event.StackId,
		RequestId: event.RequestId,
		LogicalResourceId: event.LogicalResourceId,
		NoEcho: false,
		Data: {},
	});

	return new Promise((resolve, reject) => {
		const request = https.request(event.ResponseURL, {
			method: 'PUT',
			headers: {
				'content-type': '',
				'content-length': Buffer.byteLength(body),
			},
		}, response => {
			response.resume();
			response.on('end', resolve);
		});
		request.on('error', reject);
		request.end(body);
	});
};

exports.handler = async (event, context) => {
	let physicalResourceId = event.PhysicalResourceId || 'database-migration';
	let taskArn;

	try {
		if (event.RequestType === 'Delete') {
			await sendResponse(event, context, 'SUCCESS', physicalResourceId);
			return;
		}

		const props = event.ResourceProperties;
		const runResponse = await client.send(new RunTaskCommand({
			cluster: props.Cluster,
			taskDefinition: props.TaskDefinition,
			launchType: 'FARGATE',
			count: 1,
			propagateTags: 'TASK_DEFINITION',
			networkConfiguration: {
				awsvpcConfiguration: {
					assignPublicIp: 'DISABLED',
					subnets: props.Subnets,
					securityGroups: props.SecurityGroups,
				},
			},
		}));

		if (runResponse.failures && runResponse.failures.length > 0) {
			throw new Error('ECS failed to start the migration task: ' + JSON.stringify(runResponse.failures));
		}

		taskArn = runResponse.tasks && runResponse.tasks[0] && runResponse.tasks[0].taskArn;
		if (!taskArn) {
			throw new Error('ECS did not return an ARN for the migration task');
		}
		physicalResourceId = taskArn;

		const deadline = Date.now() + context.getRemainingTimeInMillis() - 30000;
		while (Date.now() < deadline) {
			const describeResponse = await client.send(new DescribeTasksCommand({
				cluster: props.Cluster,
				tasks: [taskArn],
			}));

			if (describeResponse.failures && describeResponse.failures.length > 0) {
				throw new Error('ECS could not describe the migration task: ' + JSON.stringify(describeResponse.failures));
			}

			const task = describeResponse.tasks && describeResponse.tasks[0];
			if (task && task.lastStatus === 'STOPPED') {
				const container = (task.containers || []).find(
					candidate => candidate.name === props.ContainerName,
				);
				if (!container || container.exitCode !== 0) {
					const taskReason = (container && container.reason) || task.stoppedReason || task.stopCode || 'unknown reason';
					const exitCode = container && container.exitCode;
					throw new Error('Database migration failed with exit code ' + exitCode + ': ' + taskReason);
				}

				await sendResponse(event, context, 'SUCCESS', physicalResourceId);
				return;
			}

			await sleep(10000);
		}

		await client.send(new StopTaskCommand({
			cluster: props.Cluster,
			task: taskArn,
			reason: 'Database migration exceeded the CloudFormation deployment timeout',
		}));
		throw new Error('Database migration timed out');
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		await sendResponse(event, context, 'FAILED', physicalResourceId, reason);
	}
};
`;

export interface DrizzleMigrateTaskProps {
	/** The RDS database instance that migrations will be applied to. */
	database: DatabaseInstance;
	/**
	 * Security group assigned to the migration Fargate task.
	 * The caller is responsible for granting this SG ingress to the database on port 5432.
	 */
	migrationSecurityGroup: GuSecurityGroup;
	/** VPC in which the Fargate task will run. */
	vpc: IVpc;
}

/**
 * Adds a one-shot Fargate migration task to the given stack.
 *
 * The task is run synchronously as part of the CloudFormation deployment.
 */
export function addDrizzleMigrateTask(
	scope: GuStack,
	{ database, migrationSecurityGroup, vpc }: DrizzleMigrateTaskProps,
): void {
	const { stack, stage } = scope;

	if (!database.secret) {
		throw new Error(
			'GuDatabaseInstance must have an associated Secrets Manager secret for migration task',
		);
	}

	// ── Artifact bucket ──────────────────────────────────────────────────────────────
	const artifactBucketName = StringParameter.valueForStringParameter(
		scope,
		'/account/services/artifact.bucket',
	);

	const artifactBucket = Bucket.fromBucketName(
		scope,
		'DatabaseMigrationsArtifactBucket',
		artifactBucketName,
	);

	// S3 object key where Riff-Raff stores the migration artifact before CloudFormation runs.
	// Format: {stack}/{stage}/{riffRaffDeploymentName}/{filename}
	// The deployment name 'dispatch-database-migrations' is defined in cdk/bin/cdk.ts.
	const artifactKey = `${stack}/${stage}/dispatch-database-migrations/database-migrations.tar.gz`;

	// ── ECS cluster ──────────────────────────────────────────────────────────────────
	const cluster = new Cluster(scope, 'DatabaseMigrationsCluster', {
		vpc,
		enableFargateCapacityProviders: true,
	});

	// ── IAM task role ─────────────────────────────────────────────────────────────────
	const taskRole = new Role(scope, 'DatabaseMigrationsTaskRole', {
		assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
		description: 'IAM role for the Dispatch database migration Fargate task',
	});

	// Read the specific migration artifact from S3.
	artifactBucket.grantRead(taskRole, artifactKey);

	// ── Fargate task definition ───────────────────────────────────────────────────────
	const taskDefinition = new FargateTaskDefinition(
		scope,
		'DatabaseMigrationTaskDefinition',
		{
			cpu: 256,
			memoryLimitMiB: 512,
			taskRole,
			// family is used as a human-readable task definition name in the AWS console.
			family: 'dispatch-database-migrations',
		},
	);

	const artifactVolume = { name: 'DatabaseMigrationsArtifactVolume' };
	taskDefinition.addVolume(artifactVolume);

	const artifactDownloader = taskDefinition.addContainer(
		'DatabaseMigrationsArtifactDownloader',
		{
			image: ContainerImage.fromRegistry(
				'public.ecr.aws/aws-cli/aws-cli:2.27.49',
			),
			command: [
				's3',
				'cp',
				`s3://${artifactBucketName}/${artifactKey}`,
				'/artifact/database-migrations.tar.gz',
			],
			logging: LogDrivers.awsLogs({
				streamPrefix: `${stack}/${stage}/dispatch-database-migrations-download`,
				logRetention: RetentionDays.ONE_MONTH,
			}),
			essential: false,
		},
	);
	artifactDownloader.addMountPoints({
		containerPath: '/artifact',
		sourceVolume: artifactVolume.name,
		readOnly: false,
	});

	const migrationContainer = taskDefinition.addContainer(
		'DatabaseMigrationsContainer',
		{
			image: ContainerImage.fromRegistry(
				'public.ecr.aws/docker/library/node:22-alpine',
			),
			entryPoint: ['/bin/sh', '-c'],
			command: [
				'mkdir -p /tmp/dispatch-migrations && ' +
					'tar -xzf /artifact/database-migrations.tar.gz -C /tmp/dispatch-migrations && ' +
					'cd /tmp/dispatch-migrations && timeout 12m node run-migrations.mjs',
			],
			// DB credentials are injected from the RDS-generated Secrets Manager secret.
			// They are never present in plaintext in CloudFormation, riff-raff.yaml, or CI logs.
			secrets: {
				DB_HOST: Secret.fromSecretsManager(database.secret, 'host'),
				DB_USERNAME: Secret.fromSecretsManager(database.secret, 'username'),
				DB_PASSWORD: Secret.fromSecretsManager(database.secret, 'password'),
			},
			logging: LogDrivers.awsLogs({
				streamPrefix: `${stack}/${stage}/dispatch-database-migrations`,
				logRetention: RetentionDays.ONE_MONTH,
			}),
			essential: true,
		},
	);
	migrationContainer.addMountPoints({
		containerPath: '/artifact',
		sourceVolume: artifactVolume.name,
		readOnly: true,
	});
	migrationContainer.addContainerDependencies({
		container: artifactDownloader,
		condition: ContainerDependencyCondition.SUCCESS,
	});

	// ── Private subnets for the task ─────────────────────────────────────────────────
	// The task runs in private subnets so it can reach the RDS instance.
	// A NAT gateway (or VPC endpoints for ECR, S3, Secrets Manager, and CloudWatch) is
	// required for the task to pull its Docker image and download the S3 artifact.
	const privateSubnets = GuVpc.subnetsFromParameter(scope, {
		app: 'dispatch-database-migrations',
		type: SubnetType.PRIVATE,
	});

	// ── Blocking CloudFormation custom resource ──────────────────────────────────────
	const runMigrationTask = new Function(scope, 'RunDatabaseMigrationTask', {
		runtime: Runtime.NODEJS_22_X,
		handler: 'index.handler',
		code: Code.fromInline(migrationHandler),
		timeout: Duration.minutes(14),
		logGroup: new LogGroup(scope, 'RunDatabaseMigrationTaskLogGroup', {
			retention: RetentionDays.ONE_MONTH,
		}),
	});
	taskDefinition.grantRun(runMigrationTask);
	runMigrationTask.addToRolePolicy(
		new PolicyStatement({
			actions: ['ecs:DescribeTasks', 'ecs:StopTask'],
			resources: ['*'],
		}),
	);
	runMigrationTask.addToRolePolicy(
		new PolicyStatement({
			actions: ['ecs:TagResource'],
			resources: ['*'],
			conditions: {
				StringEquals: { 'ecs:CreateAction': 'RunTask' },
			},
		}),
	);

	const buildId = new CfnParameter(scope, 'BuildId', { type: 'String' });
	new CustomResource(scope, 'DatabaseMigration', {
		serviceToken: runMigrationTask.functionArn,
		properties: {
			BuildId: buildId.valueAsString,
			Cluster: cluster.clusterArn,
			TaskDefinition: taskDefinition.taskDefinitionArn,
			ContainerName: migrationContainer.containerName,
			Subnets: privateSubnets.map((subnet) => subnet.subnetId),
			SecurityGroups: [migrationSecurityGroup.securityGroupId],
		},
	});
}

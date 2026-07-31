/**
 * CDK construct for the Dispatch database migration Fargate task.
 *
 * The task is triggered by an EventBridge S3 "Object Created" event whenever Riff-Raff
 * uploads the migration artifact to the team artifact bucket.  It then:
 *   1. Downloads the artifact zip from S3.
 *   2. Extracts Drizzle migration SQL files and their Node.js dependencies.
 *   3. Acquires a PostgreSQL advisory lock.
 *   4. Runs `drizzle-kit migrate` to apply any pending migrations.
 *   5. Releases the advisory lock.
 *
 * ASYNC ORDERING CAVEAT
 * ─────────────────────
 * The S3 upload (Riff-Raff step "dispatch-database-migrations") is ordered after the
 * CloudFormation deployment in riff-raff.yaml, but the EventBridge-triggered ECS task is
 * *asynchronous*: Riff-Raff considers the S3 step complete as soon as the object is uploaded
 * and does NOT wait for the Fargate task to finish.  The application Lambda deployment is
 * therefore NOT blocked on migration completion.
 *
 * Consequence: always use expand/contract (backward-compatible) migrations.  Deploy additive
 * schema changes in one release before the code that depends on them; remove old columns in a
 * later release.  Monitor the CloudWatch log group created by this construct for task failures.
 *
 * REQUIRED BUCKET CONFIGURATION
 * ──────────────────────────────
 * The Riff-Raff artifact bucket must have EventBridge notifications enabled.  In Guardian AWS
 * accounts this is typically already configured on the shared artifact bucket.  If the
 * EventBridge rule never fires, verify the bucket setting in the AWS console under
 * S3 → <bucket> → Properties → Amazon EventBridge.
 */

import * as path from 'node:path';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import {
	Cluster,
	ContainerImage,
	FargateTaskDefinition,
	LogDrivers,
	PropagatedTagSource,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { EcsTask } from 'aws-cdk-lib/aws-events-targets';
import {
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

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
 * The task is triggered automatically when Riff-Raff uploads the database migration artifact
 * to S3.  See the top-of-file docblock for ordering and async caveats.
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

	// S3 object key where Riff-Raff stores the migration artifact.
	// Format: {stack}/{stage}/{riffRaffDeploymentName}/{filename}
	// The deployment name 'dispatch-database-migrations' is defined in cdk/bin/cdk.ts.
	const artifactKey = `${stack}/${stage}/dispatch-database-migrations/database-migrations.zip`;

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

	// The awslogs log driver writes via the ECS execution role; the task role needs
	// permissions only if the task itself writes to CloudWatch directly (it does not).
	// Grant CreateLogGroup so the task can create its log group if it does not yet exist.
	taskRole.addToPolicy(
		new PolicyStatement({
			effect: Effect.ALLOW,
			actions: [
				'logs:CreateLogGroup',
				'logs:CreateLogStream',
				'logs:PutLogEvents',
			],
			resources: ['*'],
		}),
	);

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

	taskDefinition.addContainer('DatabaseMigrationsContainer', {
		// The Docker image is built from containers/database-migrations/ during CDK deploy
		// and pushed to the CDK bootstrap ECR repository.  Node.js 22 Alpine + unzip +
		// @aws-sdk/client-s3 + pg are installed during the Docker build, not at deploy time.
		image: ContainerImage.fromAsset(
			path.join(__dirname, '../../containers/database-migrations'),
		),
		environment: {
			// Bucket name is the value of the SSM parameter at deploy time — not a secret.
			ARTIFACT_BUCKET: artifactBucketName,
			ARTIFACT_KEY: artifactKey,
		},
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
	});

	// ── Private subnets for the task ─────────────────────────────────────────────────
	// The task runs in private subnets so it can reach the RDS instance.
	// A NAT gateway (or VPC endpoints for ECR, S3, Secrets Manager, and CloudWatch) is
	// required for the task to pull its Docker image and download the S3 artifact.
	const privateSubnets = GuVpc.subnetsFromParameter(scope, {
		app: 'dispatch-database-migrations',
		type: SubnetType.PRIVATE,
	});

	// ── EventBridge rule ─────────────────────────────────────────────────────────────
	// Fires when Riff-Raff uploads the exact migration artifact object to S3.
	// NOTE: The artifact bucket must have Amazon EventBridge notifications enabled.
	// In Guardian AWS accounts this is normally already configured on the shared bucket.
	const rule = new Rule(scope, 'DatabaseMigrationsArtifactRule', {
		description: `Trigger the Dispatch database migration task when ${artifactKey} is uploaded`,
		eventPattern: {
			source: ['aws.s3'],
			detailType: ['Object Created'],
			detail: {
				bucket: { name: [artifactBucketName] },
				object: { key: [artifactKey] },
			},
		},
	});

	rule.addTarget(
		new EcsTask({
			cluster,
			taskDefinition,
			subnetSelection: { subnets: privateSubnets },
			securityGroups: [migrationSecurityGroup],
			// Propagate stack/stage/app tags from the task definition to the running task.
			propagateTags: PropagatedTagSource.TASK_DEFINITION,
		}),
	);
}

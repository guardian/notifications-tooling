import { GuCertificate } from '@guardian/cdk/lib/constructs/acm';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import { GuDatabaseInstance } from '@guardian/cdk/lib/constructs/rds';
import { GuDeveloperPolicyExperimental } from '@guardian/cdk/lib/experimental/constructs/iam/policies';
import { GuApiLambda } from '@guardian/cdk/lib/patterns/api-lambda';
import type { App } from 'aws-cdk-lib';
import { Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import { Port } from 'aws-cdk-lib/aws-ec2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
	Credentials,
	DatabaseInstanceEngine,
	PostgresEngineVersion,
	SubnetGroup,
} from 'aws-cdk-lib/aws-rds';

const PAN_DOMAIN_AUTH_SETTINGS_BUCKET = 'pan-domain-auth-settings';
const LOGIN_GUTOOLS_CONFIG_BUCKET = 'login-gutools-config';
const PERMISSIONS_CACHE_BUCKET = 'permissions-cache';
const DB_PORT = 5432;

type DispatchStackProps = GuStackProps & {
	stage: 'TEST' | 'CODE' | 'PROD';
};

export class DispatchStack extends GuStack {
	constructor(scope: App, id: string, props: DispatchStackProps, app: string) {
		super(scope, id, props);

		const { stage, env } = props;
		const isProd = stage === 'PROD';
		const domainName = `${app}.${isProd ? '' : 'code.dev-'}gutools.co.uk`;
		const accountVpc = GuVpc.fromIdParameter(this, 'AccountVPC', {
			availabilityZones: Fn.getAzs(env?.region),
			publicSubnetIds: GuVpc.subnetsFromParameter(this, {
				app,
				type: SubnetType.PUBLIC,
			}).map((subnet) => subnet.subnetId),
		});

		const lambdaSecurityGroup = new GuSecurityGroup(
			this,
			'DispatchLambdaSecurityGroup',
			{
				app,
				vpc: accountVpc,
				allowAllOutbound: true,
				securityGroupName: `DispatchLambdaSecurityGroup${stage}`,
			},
		);

		const guApiLambda = new GuApiLambda(this, `${app}-lambda`, {
			fileName: `${app}.zip`,
			handler: 'handler.handler',
			runtime: Runtime.NODEJS_24_X,
			monitoringConfiguration: isProd
				? {
						http5xxAlarm: { tolerated5xxPercentage: 5 },
						snsTopicName: 'pagerduty-cloudwatch-alerts-low-priority',
					}
				: { noMonitoring: true },
			app,
			architecture: Architecture.ARM_64,
			api: {
				id: `${app}-api`,
				description:
					'API for creating, previewing, and dispatching multi-channel notifications. ' +
					'It provides a frontend for users to configure and send notifications, and a ' +
					'backend responsible for forwarding requests to relevant downstream services e.g. ' +
					'app and email notification APIs.',
			},
			reservedConcurrentExecutions: 10,
			layers: [
				LayerVersion.fromLayerVersionArn(
					this,
					'ParametersAndSecretsLayer',
					// Get the ARN from https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
					'arn:aws:lambda:eu-west-1:015030872274:layer:AWS-Parameters-and-Secrets-Lambda-Extension-Arm64:96',
				),
			],
			vpc: accountVpc,
			securityGroups: [lambdaSecurityGroup],
			allowPublicSubnet: true,
		});

		const domain = guApiLambda.api.addDomainName(`${app}-domain`, {
			certificate: new GuCertificate(this, {
				app,
				domainName,
			}),
			domainName,
		});

		new GuCname(this, 'DispatchAppDNS', {
			app,
			domainName,
			ttl: Duration.hours(1),
			resourceRecord: domain.domainNameAliasDomainName,
		});

		guApiLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:GetObject'],
				resources: [
					`arn:aws:s3:::${PAN_DOMAIN_AUTH_SETTINGS_BUCKET}/${isProd ? '' : 'code.dev-'}gutools.co.uk.settings.public`,
				],
			}),
		);

		const databaseSecurityGroup = new GuSecurityGroup(this, 'DBSecurityGroup', {
			app,
			description:
				'Allow connections from the Dispatch application lambda to the database.',
			vpc: accountVpc,
			allowAllOutbound: false,
			ingresses: [
				{
					range: lambdaSecurityGroup,
					port: Port.tcp(DB_PORT),
					description:
						'Allow ingress traffic from the Dispatch application lambda security group.',
				},
			],
		});

		const dbConfig = {
			TEST: {
				allocatedStorage: 5,
				instanceType: 'db.t4g.micro',
				multiAz: false,
				preferredMaintenanceWindow: 'Tue:08:00-Tue:08:30',
			},
			CODE: {
				allocatedStorage: 5,
				instanceType: 'db.t4g.micro',
				multiAz: false,
				preferredMaintenanceWindow: 'Tue:08:00-Tue:08:30',
			},
			PROD: {
				allocatedStorage: 10,
				instanceType: 'db.t4g.small',
				multiAz: true,
				preferredMaintenanceWindow: 'Wed:08:00-Wed:08:30',
			},
		};

		new GuDatabaseInstance(this, `DispatchDatabase`, {
			allocatedStorage: dbConfig[stage].allocatedStorage,
			allowMajorVersionUpgrade: false,
			app: `${app}-db`,
			autoMinorVersionUpgrade: true,
			credentials: Credentials.fromGeneratedSecret(app, {
				secretName: `/${stage}/${props.stack}/dispatch/db`,
			}),
			databaseName: 'dispatch',
			devXBackups: { enabled: true },
			engine: DatabaseInstanceEngine.postgres({
				version: PostgresEngineVersion.VER_18,
			}),
			iamAuthentication: true,
			instanceIdentifier: `${app}-${props.stage}-db-18`,
			instanceType: dbConfig[stage].instanceType,
			multiAz: dbConfig[stage].multiAz,
			port: DB_PORT,
			preferredMaintenanceWindow: dbConfig[stage].preferredMaintenanceWindow,
			publiclyAccessible: false,
			removalPolicy: RemovalPolicy.RETAIN,
			securityGroups: [databaseSecurityGroup],
			storageEncrypted: true,
			subnetGroup: new SubnetGroup(this, 'DBSubnetGroup', {
				vpc: accountVpc,
				vpcSubnets: {
					subnets: GuVpc.subnetsFromParameter(this, {
						type: SubnetType.PRIVATE,
					}),
				},
				description: 'Subnet for the Dispatch database',
			}),
			vpc: accountVpc,
		});

		if (!isProd) {
			new GuDeveloperPolicyExperimental(this, 'DispatchLocalPolicy', {
				grantId: 'run-dispatch-locally',
				friendlyName: 'Run dispatch locally',
				statements: [
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:GetObject'],
						resources: [
							`arn:aws:s3:::${PAN_DOMAIN_AUTH_SETTINGS_BUCKET}/local.dev-gutools.co.uk.settings.public`,
						],
					}),
					...localDevAccessPolicyStatements(this),
				],
				// This allows the local policy to cover the required login tool paths all file paths in the login tool policy statement
				withoutPolicyChecks: true,
			});
		}
	}
}

// Dispatch redirects unauthenticated users to login.gutools for authentication.
// We add extra policies so the login tool can be run locally alongside Dispatch.
const localDevAccessPolicyStatements = (stack: GuStack) => {
	const parameterKmsPolicyStatement = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['kms:Decrypt'],
		resources: [`arn:aws:kms:${stack.region}:${stack.account}:alias/aws/ssm`],
	});
	const parameterPolicyStatement = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ssm:GetParameter', 'ssm:GetParameters'],
		resources: [
			`arn:aws:ssm:${stack.region}:${stack.account}:parameter/flexible/login/DEV/*`,
		],
	});
	const s3PolicyStatement = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['s3:GetObject'],
		resources: [
			`arn:aws:s3:::${LOGIN_GUTOOLS_CONFIG_BUCKET}/DEV/*`,
			`arn:aws:s3:::${PAN_DOMAIN_AUTH_SETTINGS_BUCKET}/*`,
			// Local dev reads the CODE permissions cache
			`arn:aws:s3:::${PERMISSIONS_CACHE_BUCKET}/CODE/*`,
		],
	});
	return [
		parameterKmsPolicyStatement,
		parameterPolicyStatement,
		s3PolicyStatement,
	];
};

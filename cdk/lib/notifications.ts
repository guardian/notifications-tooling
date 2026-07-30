import { GuCertificate } from '@guardian/cdk/lib/constructs/acm';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuDeveloperPolicyExperimental } from '@guardian/cdk/lib/experimental/constructs/iam/policies';
import { GuApiLambda } from '@guardian/cdk/lib/patterns/api-lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

const PAN_DOMAIN_AUTH_SETTINGS_BUCKET = 'pan-domain-auth-settings';
const LOGIN_GUTOOLS_CONFIG_BUCKET = 'login-gutools-config';
const PERMISSIONS_CACHE_BUCKET = 'permissions-cache';

export class DispatchStack extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps, app: string) {
		super(scope, id, props);

		const { stage } = props;
		const isProd = stage === 'PROD';
		const domainName = `${app}.${isProd ? '' : 'code.dev-'}gutools.co.uk`;

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
			api: {
				id: `${app}-api`,
				description:
					'API for creating, previewing, and dispatching multi-channel notifications. ' +
					'It provides a frontend for users to configure and send notifications, and a ' +
					'backend responsible for forwarding requests to relevant downstream services e.g. ' +
					'app and email notification APIs.',
			},
			reservedConcurrentExecutions: 10,
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

		const pandaSettingsPolicyStatement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['s3:GetObject'],
			resources: [
				`arn:aws:s3:::${PAN_DOMAIN_AUTH_SETTINGS_BUCKET}/${isProd ? '' : 'code.dev-'}gutools.co.uk.settings.public`,
			],
		});

		guApiLambda.addToRolePolicy(pandaSettingsPolicyStatement);

		const localPandaSettingsPolicyStatement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['s3:GetObject'],
			resources: [
				`arn:aws:s3:::${PAN_DOMAIN_AUTH_SETTINGS_BUCKET}/local.dev-gutools.co.uk.settings.public`,
			],
		});

		if (!isProd) {
			new GuDeveloperPolicyExperimental(this, 'DispatchLocalPolicy', {
				grantId: 'run-dispatch-locally',
				friendlyName: 'Run dispatch locally',
				statements: [
					localPandaSettingsPolicyStatement,
					...localLoginToolPolicyStatements(this),
				],
				// This allows the local policy to cover the required login tool paths all file paths in the login tool policy statement
				withoutPolicyChecks: true,
			});
		}
	}
}

// Dispatch redirects unauthenticated users to login.gutools for authentication.
// We add extra policies so the login tool can be run locally alongside Dispatch.
const localLoginToolPolicyStatements = (stack: GuStack) => {
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

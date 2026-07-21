import { GuCertificate } from '@guardian/cdk/lib/constructs/acm';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuApiLambda } from '@guardian/cdk/lib/patterns/api-lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

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
				description: 'API for the notifications tooling',
			},
			reservedConcurrentExecutions: 1,
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
	}
}

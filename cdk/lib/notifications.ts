import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuApiLambda } from '@guardian/cdk/lib/patterns/api-lambda';
import type { App } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class NotificationsToolingStack extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps, appName: string) {
		super(scope, id, props);

		new GuApiLambda(this, `${appName}-lambda`, {
			fileName: `${appName}.zip`,
			handler: 'backend/handler.handler',
			runtime: Runtime.NODEJS_24_X,
			monitoringConfiguration: {
				http5xxAlarm: { tolerated5xxPercentage: 5 },
				snsTopicName: 'alerts-topic',
			},
			app: appName,
			api: {
				id: `${appName}-api`,
				description: 'API for the notifications tooling',
			},
			reservedConcurrentExecutions: 1,
		});
	}
}

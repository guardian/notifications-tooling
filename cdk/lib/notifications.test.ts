import { describe, expect, it } from 'bun:test';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DispatchStack } from './notifications';
import { addDispatchStacks } from './register-stacks';

describe('The Notifications stack', () => {
	it.each(['CODE', 'PROD'] as const)(
		'creates a retained runtime database secret in %s',
		(stage) => {
			const stack = new DispatchStack(
				new App(),
				`Dispatch${stage}`,
				{ stack: 'notifications', stage, env: { region: 'eu-west-1' } },
				'dispatch',
			);
			const template = Template.fromStack(stack);

			template.hasResource('AWS::SecretsManager::Secret', {
				DeletionPolicy: 'Retain',
				UpdateReplacePolicy: 'Retain',
				Properties: Match.objectLike({
					Name: `/${stage}/notifications/dispatch/app-db`,
					GenerateSecretString: {
						GenerateStringKey: 'password',
						PasswordLength: 32,
						ExcludePunctuation: true,
						SecretStringTemplate: {
							'Fn::Join': [
								'',
								[
									'{"host":"',
									{ 'Fn::GetAtt': [Match.anyValue(), 'Endpoint.Address'] },
									'","port":5432,"dbname":"dispatchdb","username":"dispatch_runtime"}',
								],
							],
						},
					},
				}),
			});
		},
	);

	it('matches the snapshot', () => {
		const app = new App();
		const stack = new DispatchStack(
			app,
			'Dispatch',
			{ stack: 'notifications', stage: 'TEST', env: { region: 'eu-west-1' } },
			'dispatch',
		);
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('registers both CODE and PROD stacks in the CDK app', () => {
		const app = new GuRoot();
		addDispatchStacks(app);

		expect(app.node.children.map((child) => child.node.id)).toEqual([
			'Dispatch-euwest-1-CODE',
			'Dispatch-euwest-1-PROD',
		]);
	});

	it('configures API Gateway to decode binary image responses', () => {
		const app = new App();
		const stack = new DispatchStack(
			app,
			'Dispatch',
			{ stack: 'notifications', stage: 'TEST', env: { region: 'eu-west-1' } },
			'dispatch',
		);
		const template = Template.fromStack(stack);

		template.hasResourceProperties('AWS::ApiGateway::RestApi', {
			BinaryMediaTypes: ['image/*'],
		});
	});
});

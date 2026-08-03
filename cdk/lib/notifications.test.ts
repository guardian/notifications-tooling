import { describe, expect, it } from 'bun:test';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DispatchStack } from './notifications';

describe('The Notifications stack', () => {
	const createTemplate = () => {
		const app = new App();
		const stack = new DispatchStack(
			app,
			'Dispatch',
			{
				stack: 'notifications',
				stage: 'TEST',
				env: { region: 'eu-west-1' },
			},
			'dispatch',
		);
		return Template.fromStack(stack);
	};

	it('matches the snapshot', () => {
		expect(createTemplate().toJSON()).toMatchSnapshot();
	});

	it('blocks CloudFormation on the database migration task', () => {
		const template = createTemplate();
		const synthesizedTemplate = template.toJSON() as {
			Parameters?: Record<string, unknown>;
		};

		template.resourceCountIs('AWS::Events::Rule', 0);
		template.resourceCountIs('AWS::StepFunctions::StateMachine', 0);
		expect(
			Object.keys(synthesizedTemplate.Parameters ?? {}).some((name) =>
				name.startsWith('AssetParameters'),
			),
		).toBe(false);
		template.hasResourceProperties('AWS::CloudFormation::CustomResource', {
			BuildId: { Ref: 'BuildId' },
			ContainerName: 'DatabaseMigrationsContainer',
		});
		template.hasResourceProperties(
			'AWS::ECS::TaskDefinition',
			Match.objectLike({
				ContainerDefinitions: Match.arrayWith([
					Match.objectLike({
						DependsOn: [
							{
								Condition: 'SUCCESS',
								ContainerName: 'DatabaseMigrationsArtifactDownloader',
							},
						],
						Name: 'DatabaseMigrationsContainer',
					}),
				]),
			}),
		);
	});
});

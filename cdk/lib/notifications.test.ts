import { describe, expect, it } from 'bun:test';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DispatchStack } from './notifications';
import { addDispatchStacks } from './register-stacks';

describe('The Notifications stack', () => {
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
});

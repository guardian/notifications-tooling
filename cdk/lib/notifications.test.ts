import { App } from 'aws-cdk-lib';
import { describe, expect, it } from 'bun:test';
import { Template } from 'aws-cdk-lib/assertions';
import { DispatchStack } from './notifications';

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
});

import type { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { DispatchStack } from './notifications';

export const addDispatchStacks = (app: GuRoot) => {
	new DispatchStack(
		app,
		'Dispatch-euwest-1-CODE',
		{ stack: 'notifications', stage: 'CODE', env: { region: 'eu-west-1' } },
		'dispatch',
	);
	new DispatchStack(
		app,
		'Dispatch-euwest-1-PROD',
		{ stack: 'notifications', stage: 'PROD', env: { region: 'eu-west-1' } },
		'dispatch',
	);
};

import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { DispatchStack } from '../lib/notifications';

const app = new GuRoot();
new DispatchStack(
	app,
	'Dispatch-euwest-1-CODE',
	{ stack: 'notifications', stage: 'CODE', env: { region: 'eu-west-1' } },
	'dispatch',
);

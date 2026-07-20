import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { NotificationsToolingStack } from '../lib/notifications';

const app = new GuRoot();
new NotificationsToolingStack(
	app,
	'Notifications-euwest-1-CODE',
	{ stack: 'deploy', stage: 'CODE', env: { region: 'eu-west-1' } },
	'notifications-tooling',
);

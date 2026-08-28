import { expect, mock } from 'bun:test';
import { NotificationChannel } from '@config';
import type { DispatchNotificationDependencies } from './shared';

// `expect.any(String)` is typed `any`; cast so it sits in typed positions.
export const anyString = expect.any(String) as unknown as string;

export const pushItem = {
	type: NotificationChannel.AppPushNotification,
	title: 'Breaking news',
	body: 'Lead summary',
	link: 'https://www.theguardian.com/world/2026/jul/22/lead',
} as const;

export const newsletterItem = {
	type: NotificationChannel.Newsletter,
	title: 'Lead story',
	body: 'Lead summary',
	link: 'https://www.theguardian.com/world/2026/jul/22/lead',
} as const;

export const baseRequest = {
	idempotencyKey: 'dispatch-test',
	sender: 'dispatch-test',
	options: { dryRun: false, scheduledFor: null },
} as const;

export const notificationId = 'notif-2f1c9a7e';
export const testId = 'test-9c1d5b2a';

const ssmParameters: Record<string, string> = {
	BRAZE_API_KEY: 'test-api-key',
	BRAZE_REST_ENDPOINT: 'https://rest.example.braze.eu',
	BRAZE_APP_ID: 'test-app-id',
	BRAZE_TEST_EMAIL_FROM: 'dev testing <dev-testing@email.theguardian.com>',
	BRAZE_TEST_EMAIL_REPLY_TO: 'NO_REPLY_TO',
	EMAIL_RENDERING_ENDPOINT: 'https://email-rendering.example.com',
	MOBILE_N10N_ENDPOINT: 'https://n10n.example.com',
	MOBILE_N10N_API_KEY: 'test-n10n-key',
};

export const createDependencies = () => {
	const getSSMParameter = mock((key: string) =>
		Promise.resolve(ssmParameters[key] ?? ''),
	);
	const sendAppNotification = mock(() =>
		Promise.resolve({ id: 'n10n-id', status: 201 }),
	);
	const renderEmail = mock(() =>
		Promise.resolve('<html>Rendered newsletter</html>'),
	);
	const sendBrazeCampaign = mock(() =>
		Promise.resolve({
			message: 'success',
			dispatch_id: 'dispatch-123',
			status: 201,
		}),
	);
	const registerBrazeTestEmailRecipients = mock(() => Promise.resolve());
	const sendBrazeTestEmail = mock(() =>
		Promise.resolve({
			message: 'success',
			dispatch_id: 'test-dispatch-123',
			status: 201,
		}),
	);
	const dependencies: DispatchNotificationDependencies = {
		getSSMParameter,
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
		registerBrazeTestEmailRecipients,
		sendBrazeTestEmail,
	};

	return {
		dependencies,
		getSSMParameter,
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
		registerBrazeTestEmailRecipients,
		sendBrazeTestEmail,
	};
};

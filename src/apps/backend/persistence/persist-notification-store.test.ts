import { beforeEach, describe, expect, it } from 'bun:test';
import {
	createNotificationMock,
	installDatabaseMock,
} from '../utils/test-utils/database';

installDatabaseMock();

const { notificationSendRequestSchema } =
	await import('../routers/notifications/schemas/notification-send-request');
const { sendNotificationStore } = await import('./persist-notification');

describe('sendNotificationStore', () => {
	beforeEach(() => {
		createNotificationMock.mockClear();
	});

	it('persists the normalized article ID from the composed content item', async () => {
		const request = notificationSendRequestSchema.parse({
			idempotencyKey: 'push-2026-09-23',
			sender: 'notifications-tooling-spa/v1',
			content: {
				items: {
					unused: {
						type: 'newsletter',
						title: 'Unused article',
						body: 'This item is not composed.',
						link: 'https://www.theguardian.com/world/2026/sep/22/unused-article',
					},
					lead: {
						type: 'app-push',
						title: 'Northern lights',
						body: 'Northern lights visible across the UK.',
						link: 'https://www.theguardian.com/science/2026/sep/23/northern-lights?CMP=share_btn_url#comments',
					},
				},
			},
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'lead' },
				},
			},
		});

		await sendNotificationStore.create(request, 'editor@theguardian.com');

		expect(createNotificationMock).toHaveBeenCalledTimes(1);
		expect(createNotificationMock).toHaveBeenCalledWith({
			kind: 'send',
			idempotencyKey: 'push-2026-09-23',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'editor@theguardian.com',
			dryRun: false,
			scheduledFor: null,
			articleId: 'science/2026/sep/23/northern-lights',
			content: request.content,
			channels: request.channels,
		});
	});
});

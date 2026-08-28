import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { EmailRenderingError } from '@services';
import type { NotificationSendRequest } from '../routers/notifications/schemas/notification-send-request';
import { dispatchNotification } from './dispatch-notification';
import {
	baseRequest,
	createDependencies,
	newsletterItem,
	notificationId,
	pushItem,
} from './test-support';

describe('dispatchNotification', () => {
	it('dispatches every channel in a combined request', async () => {
		const {
			dependencies,
			renderEmail,
			sendAppNotification,
			sendBrazeCampaign,
		} = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { push: pushItem, newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'UK' }],
					},
					compose: { use: 'push' },
				},
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['newsletter'], subject: 'Daily briefing' },
				},
			},
		};

		await dispatchNotification(request, notificationId, dependencies);
		expect(renderEmail).toHaveBeenCalledTimes(1);
		expect(sendBrazeCampaign).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
	});

	it('surfaces a provider failure while still attempting the other channel', async () => {
		const { dependencies, renderEmail, sendAppNotification } =
			createDependencies();
		const renderingError = new EmailRenderingError(500, 'http_error');
		renderEmail.mockRejectedValue(renderingError);
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { push: pushItem, newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'UK' }],
					},
					compose: { use: 'push' },
				},
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['newsletter'], subject: 'Daily briefing' },
				},
			},
		};

		// The newsletter failure is returned (not thrown) so the router can persist
		// every outcome, then surface the documented 502/504 instead of a false 202.
		const { error } = await dispatchNotification(
			request,
			notificationId,
			dependencies,
		);

		expect(error).toBe(renderingError);

		// Neither channel aborts the other: the push is still attempted.
		expect(renderEmail).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
	});

	it('does not call downstream clients for a dry run', async () => {
		const {
			dependencies,
			renderEmail,
			sendAppNotification,
			sendBrazeCampaign,
		} = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			options: { dryRun: true, scheduledFor: null },
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'UK' }],
					},
					compose: { use: 'lead' },
				},
			},
		};

		await dispatchNotification(request, notificationId, dependencies);
		expect(renderEmail).not.toHaveBeenCalled();
		expect(sendBrazeCampaign).not.toHaveBeenCalled();
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});

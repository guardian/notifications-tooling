import { describe, expect, it } from 'bun:test';
import { newsletterSegments, NotificationChannel } from '@config';
import { EmailRenderingError } from '@services';
import type { NotificationSendRequest } from '../routers/notifications/schemas/notification-send-request';
import { dispatchNotification } from './dispatch-notification';
import {
	anyString,
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
						items: [{ type: 'breaking-news', name: 'uk' }],
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

	it('records a failed newsletter send while the push succeeds', async () => {
		const { dependencies, renderEmail, sendAppNotification } =
			createDependencies();
		renderEmail.mockRejectedValue(new EmailRenderingError(500, 'http_error'));
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { push: pushItem, newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'push' },
				},
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['newsletter'], subject: 'Daily briefing' },
				},
			},
		};

		const outcomes = await dispatchNotification(
			request,
			notificationId,
			dependencies,
		);

		// Neither channel aborts the other; each failure is reported on its own.
		expect(renderEmail).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				status: 'success',
			},
		]);
		expect(outcomes.newsletter).toEqual([
			{
				notificationId,
				segmentId: 'UK',
				campaignId: newsletterSegments.UK.brazeCampaignId,
				status: 'failure',
				failureReason: 'http_error',
			},
		]);
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
						items: [{ type: 'breaking-news', name: 'uk' }],
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

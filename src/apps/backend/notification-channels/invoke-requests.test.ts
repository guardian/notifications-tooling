import { describe, expect, it, mock } from 'bun:test';
import type { NotificationChannelClients } from './invoke-requests';
import { invokeNotificationChannelRequests } from './invoke-requests';

describe('invokeNotificationChannelRequests', () => {
	it('invokes Braze and the mocked app-notification channel', async () => {
		const triggerCampaign = mock(() =>
			Promise.resolve({
				message: 'success',
				dispatch_id: 'dispatch-123',
			}),
		);
		const sendAppNotification = mock(() =>
			Promise.resolve({
				status: 'mocked' as const,
			}),
		);
		const clients: NotificationChannelClients = {
			braze: { triggerCampaign },
			appNotification: { send: sendAppNotification },
		};
		const emailRequest = {
			broadcast: true,
			campaign_id: 'campaign-uk',
			trigger_properties: {
				body: '<html>News</html>',
				subject: 'Breaking news',
			},
		} as const;
		const appNotificationRequest = {
			topics: [{ type: 'breaking', name: 'uk' }],
			title: 'Breaking news',
			body: 'Lead summary',
			link: 'https://www.theguardian.com/world/lead',
		};

		const results = await invokeNotificationChannelRequests(
			[
				{ channel: 'email', status: 'generated', request: emailRequest },
				{
					channel: 'app-notification',
					status: 'not_implemented',
					request: appNotificationRequest,
				},
			],
			clients,
		);

		expect(triggerCampaign).toHaveBeenCalledWith(emailRequest);
		expect(sendAppNotification).toHaveBeenCalledWith(appNotificationRequest);
		expect(results).toEqual([
			{ channel: 'email', status: 'sent', dispatchId: 'dispatch-123' },
			{ channel: 'app-notification', status: 'mocked' },
		]);
	});

	it('does not hide provider failures', () => {
		const clients: NotificationChannelClients = {
			braze: {
				triggerCampaign: () => Promise.reject(new Error('Braze unavailable')),
			},
			appNotification: {
				send: () => Promise.resolve({ status: 'mocked' }),
			},
		};

		expect(
			invokeNotificationChannelRequests(
				[
					{
						channel: 'email',
						status: 'generated',
						request: {
							broadcast: true,
							campaign_id: 'campaign-uk',
							trigger_properties: { body: 'Body', subject: 'Subject' },
						},
					},
				],
				clients,
			),
		).rejects.toThrow('Braze unavailable');
	});
});

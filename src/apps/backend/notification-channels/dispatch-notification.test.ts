import { describe, expect, it, mock } from 'bun:test';
import type { DispatchNotificationDependencies } from './dispatch-notification';
import { dispatchNotification } from './dispatch-notification';

const createDependencies = () => {
	const render = mock(() =>
		Promise.resolve('<html>Rendered newsletter</html>'),
	);
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
	const dependencies: DispatchNotificationDependencies = {
		generatorConfig: {
			brazeCampaignIds: {
				UK: 'campaign-uk',
				US: 'campaign-us',
				AU: 'campaign-au',
			},
		},
		clients: {
			braze: { triggerCampaign },
			appNotification: { send: sendAppNotification },
		},
		newsletterRenderer: { render },
	};

	return { dependencies, render, triggerCampaign, sendAppNotification };
};

describe('dispatchNotification', () => {
	it('renders and sends newsletter plans for every audience segment', async () => {
		const { dependencies, render, triggerCampaign } = createDependencies();
		const lead = {
			type: 'newsletter' as const,
			title: 'Lead story',
			body: 'Lead summary',
			link: 'https://www.theguardian.com/world/lead',
		};

		const results = await dispatchNotification(
			{
				content: { items: { lead } },
				channels: [
					{
						channel: 'newsletter',
						audience: {
							type: 'segment',
							segments: [{ id: 'UK' }, { id: 'US' }],
						},
						compose: { items: ['lead'], subject: 'Daily briefing' },
					},
				],
			},
			dependencies,
		);

		expect(render).toHaveBeenCalledWith({
			items: [lead],
			subject: 'Daily briefing',
		});
		expect(triggerCampaign).toHaveBeenCalledTimes(2);
		expect(triggerCampaign).toHaveBeenNthCalledWith(1, {
			broadcast: true,
			campaign_id: 'campaign-uk',
			trigger_properties: {
				body: '<html>Rendered newsletter</html>',
				subject: 'Daily briefing',
			},
		});
		expect(triggerCampaign).toHaveBeenNthCalledWith(2, {
			broadcast: true,
			campaign_id: 'campaign-us',
			trigger_properties: {
				body: '<html>Rendered newsletter</html>',
				subject: 'Daily briefing',
			},
		});
		expect(results).toEqual([
			{ channel: 'email', status: 'sent', dispatchId: 'dispatch-123' },
			{ channel: 'email', status: 'sent', dispatchId: 'dispatch-123' },
		]);
	});

	it('invokes both requested channel plans', async () => {
		const { dependencies, triggerCampaign, sendAppNotification } =
			createDependencies();
		const pushRequest = {
			topics: [{ type: 'breaking', name: 'au' }],
			title: 'Breaking news',
			body: 'Lead summary',
			link: 'https://www.theguardian.com/world/lead',
		};

		const results = await dispatchNotification(
			{
				content: {
					items: {
						newsletterLead: {
							type: 'newsletter',
							title: 'Lead story',
							body: 'Lead summary',
							link: 'https://www.theguardian.com/world/lead',
						},
						pushLead: {
							type: 'app-push-notification',
							title: 'Breaking news',
							body: 'Lead summary',
							link: 'https://www.theguardian.com/world/lead',
						},
					},
				},
				channels: [
					{
						channel: 'newsletter',
						audience: { type: 'segment', segments: [{ id: 'AU' }] },
						compose: {
							items: ['newsletterLead'],
							subject: 'Daily briefing',
						},
					},
					{
						channel: 'app-push-notification',
						audience: {
							type: 'topic',
							topics: [{ type: 'breaking', name: 'au' }],
						},
						compose: { use: 'pushLead' },
					},
				],
			},
			dependencies,
		);

		expect(triggerCampaign).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledWith(pushRequest);
		expect(results).toEqual([
			{ channel: 'email', status: 'sent', dispatchId: 'dispatch-123' },
			{ channel: 'app-notification', status: 'mocked' },
		]);
	});
});

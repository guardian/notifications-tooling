import { describe, expect, it } from 'bun:test';
import {
	generateNotificationChannelRequest,
	generateNotificationChannelRequests,
	type NotificationChannelConfig,
} from './generate-requests';

const config: NotificationChannelConfig = {
	brazeCampaignIds: {
		UK: 'campaign-uk',
		US: 'campaign-us',
		AU: 'campaign-au',
	},
};

const appNotificationRequest = {
	topics: [{ type: 'breaking', name: 'uk' }],
	title: 'Breaking news',
	body: 'Lead summary',
	link: 'https://www.theguardian.com/world/lead',
};

describe('generateNotificationChannelRequest', () => {
	it('generates an email request for the selected office campaign', () => {
		expect(
			generateNotificationChannelRequest(
				{
					channel: 'email',
					audienceSegment: 'AU',
					html: '<html>Australian news</html>',
					subject: 'Australian briefing',
				},
				config,
			),
		).toEqual({
			channel: 'email',
			status: 'generated',
			request: {
				broadcast: true,
				campaign_id: 'campaign-au',
				trigger_properties: {
					body: '<html>Australian news</html>',
					subject: 'Australian briefing',
				},
			},
		});
	});

	it('reports that app notification generation is not implemented', () => {
		expect(
			generateNotificationChannelRequest(
				{ channel: 'app-notification', request: appNotificationRequest },
				config,
			),
		).toEqual({
			channel: 'app-notification',
			status: 'not_implemented',
			request: appNotificationRequest,
		});
	});
});

describe('generateNotificationChannelRequests', () => {
	it('generates a result for every requested channel', () => {
		const results = generateNotificationChannelRequests(
			[
				{
					channel: 'email',
					audienceSegment: 'UK',
					html: '<html>UK news</html>',
					subject: 'UK briefing',
				},
				{ channel: 'app-notification', request: appNotificationRequest },
			],
			config,
		);

		expect(results).toHaveLength(2);
		expect(results[0]).toEqual({
			channel: 'email',
			status: 'generated',
			request: {
				broadcast: true,
				campaign_id: 'campaign-uk',
				trigger_properties: {
					body: '<html>UK news</html>',
					subject: 'UK briefing',
				},
			},
		});
		expect(results[1]).toEqual({
			channel: 'app-notification',
			status: 'not_implemented',
			request: appNotificationRequest,
		});
	});

	it('does not hide email generation errors', () => {
		expect(() =>
			generateNotificationChannelRequests(
				[
					{
						channel: 'email',
						audienceSegment: 'US',
						html: '<html>US news</html>',
						subject: 'US briefing',
					},
					{ channel: 'app-notification', request: appNotificationRequest },
				],
				{
					brazeCampaignIds: {
						...config.brazeCampaignIds,
						US: ' ',
					},
				},
			),
		).toThrow('No Braze campaign ID is configured for US.');
	});
});

import { describe, expect, it } from 'bun:test';
import { generateAppNotificationRequest } from './generate-request';

describe('generateAppNotificationRequest', () => {
	it('generates a not-implemented placeholder', () => {
		const request = {
			topics: [{ type: 'breaking', name: 'uk' }],
			title: 'Breaking news',
			body: 'Lead summary',
			link: 'https://www.theguardian.com/world/lead',
		};

		expect(generateAppNotificationRequest(request)).toEqual({
			status: 'not_implemented',
			request,
		});
	});
});

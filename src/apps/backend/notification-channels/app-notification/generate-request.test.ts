import { describe, expect, it } from 'bun:test';
import { generateAppNotificationRequest } from './generate-request';

describe('generateAppNotificationRequest', () => {
	it('generates a not-implemented placeholder', () => {
		expect(generateAppNotificationRequest()).toEqual({
			status: 'not_implemented',
		});
	});
});

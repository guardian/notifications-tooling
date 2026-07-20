import { describe, expect, it } from 'bun:test';
import {
	AppNotificationRequestNotImplementedError,
	generateAppNotificationRequest,
} from './generate-request';

describe('generateAppNotificationRequest', () => {
	it('reports that app notification generation is not implemented', () => {
		expect(generateAppNotificationRequest).toThrow(
			AppNotificationRequestNotImplementedError,
		);
	});
});

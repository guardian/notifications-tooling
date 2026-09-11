import { describe, expect, it } from 'bun:test';
import {
	failedNewsletterSendResponse,
	partiallyDeliveredAppPushSendResponse,
} from '../testing/api-fixtures';
import { summarizeFailure } from './HistoryFailureDetail';

describe('summarizeFailure', () => {
	it('describes a partial failure and confirms that some recipients received it', () => {
		expect(summarizeFailure(partiallyDeliveredAppPushSendResponse)).toEqual({
			failedChannels: ['App alert'],
			failedDestinations: ['breaking-news: us'],
			failureReasons: ['The delivery service rejected the request.'],
			anyRecipientsReceived: true,
		});
	});

	it('describes a total failure and confirms that no recipients received it', () => {
		expect(summarizeFailure(failedNewsletterSendResponse)).toEqual({
			failedChannels: ['Newsletter email'],
			failedDestinations: ['UK'],
			failureReasons: ['The delivery service rejected the request.'],
			anyRecipientsReceived: false,
		});
	});
});

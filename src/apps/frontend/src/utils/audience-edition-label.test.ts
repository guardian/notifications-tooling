import { describe, expect, it } from 'bun:test';
import type { ChannelAudienceResponse } from '../schemas';
import { getAudienceEditionLabel } from './audience-edition-label';

const audiences: ChannelAudienceResponse = {
	channels: {
		newsletter: {
			segments: [{ id: 'UK', label: 'United Kingdom readers' }],
		},
		'app-push': {
			topicTypes: [
				{
					id: 'breaking-news',
					label: 'Breaking news',
					editions: [{ id: 'uk', label: 'UK breaking-news users' }],
				},
				{
					id: 'sport',
					label: 'Sport',
					editions: [{ id: 'uk', label: 'UK sport users' }],
				},
			],
		},
	},
};

describe('getAudienceEditionLabel', () => {
	it('uses the backend newsletter segment label', () => {
		expect(
			getAudienceEditionLabel({
				audiences,
				channel: 'newsletter',
				edition: 'UK',
			}),
		).toBe('United Kingdom readers');
	});

	it('uses the backend edition label for the matching app-alert topic', () => {
		expect(
			getAudienceEditionLabel({
				audiences,
				channel: 'app-push',
				edition: 'UK',
				topicTypeId: 'sport',
			}),
		).toBe('UK sport users');
	});

	it('prefers a newsletter label for a channel-agnostic audience', () => {
		expect(
			getAudienceEditionLabel({
				audiences,
				edition: 'UK',
			}),
		).toBe('United Kingdom readers');
	});

	it('uses the centralized fallback when the backend has no label', () => {
		expect(
			getAudienceEditionLabel({
				audiences,
				channel: 'app-push',
				edition: 'EU',
			}),
		).toBe('Europe');
	});
});

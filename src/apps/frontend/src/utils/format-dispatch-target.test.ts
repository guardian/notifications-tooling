import { describe, expect, it } from 'bun:test';
import type { ChannelAudienceResponse } from '../schemas';
import { formatDispatchTarget } from './format-dispatch-target';

const audiences: ChannelAudienceResponse = {
	channels: {
		newsletter: {
			segments: [{ id: 'US', label: 'US readers' }],
		},
		'app-push': {
			topicTypes: [
				{
					id: 'breaking-news',
					label: 'Breaking news',
					editions: [{ id: 'uk', label: 'United Kingdom app users' }],
				},
			],
		},
	},
};

describe('formatDispatchTarget', () => {
	describe('newsletter dispatches', () => {
		it('uses the audience label when the segment is configured', () => {
			expect(
				formatDispatchTarget(
					{ channel: 'newsletter', segment: 'US' },
					audiences,
				),
			).toBe('US readers');
		});

		it('uses the fallback label when audience data is unavailable', () => {
			expect(
				formatDispatchTarget({ channel: 'newsletter', segment: 'UK' }),
			).toBe('United Kingdom');
		});

		it('uses the segment ID when no label exists', () => {
			expect(
				formatDispatchTarget({
					channel: 'newsletter',
					segment: 'unknown-segment',
				}),
			).toBe('unknown-segment');
		});
	});

	describe('app-push dispatches', () => {
		it('uses audience labels before fallback labels and joins editions', () => {
			expect(
				formatDispatchTarget(
					{
						channel: 'app-push',
						topicType: 'breaking-news',
						editions: ['uk', 'us'],
					},
					audiences,
				),
			).toBe('United Kingdom app users, US');
		});

		it('uses edition IDs when no labels exist', () => {
			expect(
				formatDispatchTarget({
					channel: 'app-push',
					topicType: 'unknown-topic',
					editions: ['unknown-edition', 'another-edition'],
				}),
			).toBe('unknown-edition, another-edition');
		});
	});
});

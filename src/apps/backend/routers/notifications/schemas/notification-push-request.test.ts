import {
	MAX_PUSH_TOPICS,
	NEWSLETTER_SEGMENTS,
	NOTIFICATION_CHANNEL,
	NOTIFICATION_CHANNEL_CONTENT_LIMITS,
	PUSH_TOPICS,
} from '@config';
import { describe, expect, it } from 'bun:test';
import { notificationPushRequestSchema } from './notification-push-request';

const pushLimits =
	NOTIFICATION_CHANNEL_CONTENT_LIMITS[
		NOTIFICATION_CHANNEL.APP_PUSH_NOTIFICATION
	];
const newsletterLimits =
	NOTIFICATION_CHANNEL_CONTENT_LIMITS[NOTIFICATION_CHANNEL.NEWSLETTER];

const guardianLink =
	'https://www.theguardian.com/world/2026/jul/08/ukraine-summit';

const repeat = (length: number) => 'a'.repeat(length);

// --- Fixture builders (each returns a fresh object; override via spread) ---

const pushItem = (overrides: Record<string, unknown> = {}) => ({
	type: NOTIFICATION_CHANNEL.APP_PUSH_NOTIFICATION,
	title: 'Ukraine summit begins',
	body: 'World leaders gather in Geneva as talks open.',
	link: guardianLink,
	...overrides,
});

const newsletterItem = (overrides: Record<string, unknown> = {}) => ({
	type: NOTIFICATION_CHANNEL.NEWSLETTER,
	title: 'Your morning briefing',
	body: 'Today the world woke up to a historic summit.',
	link: guardianLink,
	...overrides,
});

const pushPlan = (overrides: Record<string, unknown> = {}) => ({
	channel: NOTIFICATION_CHANNEL.APP_PUSH_NOTIFICATION,
	audience: { type: 'topic', topics: [{ type: 'breaking', name: 'uk' }] },
	compose: { use: 'lead' },
	...overrides,
});

const newsletterPlan = (overrides: Record<string, unknown> = {}) => ({
	channel: NOTIFICATION_CHANNEL.NEWSLETTER,
	audience: { type: 'segment', segments: [{ name: NEWSLETTER_SEGMENTS[0] }] },
	compose: { items: ['lead'], subject: 'Your morning briefing' },
	...overrides,
});

const pushRequest = (overrides: Record<string, unknown> = {}) => ({
	idempotencyKey: 'push-2026-07-08',
	category: 'editorial',
	sender: 'notifications-tooling-spa/v1',
	content: { items: { lead: pushItem() } },
	channels: [pushPlan()],
	...overrides,
});

const newsletterRequest = (overrides: Record<string, unknown> = {}) => ({
	idempotencyKey: 'mb-2026-07-08',
	category: 'editorial',
	sender: 'notifications-tooling-spa/v1',
	content: { items: { lead: newsletterItem() } },
	channels: [newsletterPlan()],
	...overrides,
});

const combinedRequest = (overrides: Record<string, unknown> = {}) => ({
	idempotencyKey: 'combined-2026-07-08',
	category: 'editorial',
	sender: 'notifications-tooling-spa/v1',
	content: {
		items: {
			pushLead: pushItem(),
			newsLead: newsletterItem(),
		},
	},
	channels: [
		pushPlan({ compose: { use: 'pushLead' } }),
		newsletterPlan({ compose: { items: ['newsLead'], subject: 'Briefing' } }),
	],
	...overrides,
});

const pushRequestWithItem = (item: Record<string, unknown>) =>
	pushRequest({ content: { items: { lead: item } } });

const newsletterRequestWithItem = (item: Record<string, unknown>) =>
	newsletterRequest({ content: { items: { lead: item } } });

const pushRequestWithPlan = (plan: Record<string, unknown>) =>
	pushRequest({ channels: [plan] });

const newsletterRequestWithPlan = (plan: Record<string, unknown>) =>
	newsletterRequest({ channels: [plan] });

// --- Assertion helpers ---

const parse = (input: unknown) =>
	notificationPushRequestSchema.safeParse(input);

const expectValid = (input: unknown) => {
	const result = parse(input);
	if (!result.success) {
		throw new Error(
			`expected a valid payload, but validation failed with:\n${JSON.stringify(
				result.error.issues,
				null,
				2,
			)}`,
		);
	}
	return result.data;
};

const issuesOf = (input: unknown) => {
	const result = parse(input);
	expect(result.success).toBe(false);
	return result.success ? [] : result.error.issues;
};

const pathsOf = (input: unknown) =>
	issuesOf(input).map((issue) => issue.path.join('/'));

describe('notificationPushRequestSchema', () => {
	describe('happy paths', () => {
		it('accepts a newsletter push with a single content item', () => {
			const data = expectValid(newsletterRequest());

			// The fully normalised payload, with request-level defaults
			// (`priority`, `options`) and the newsletter `layout` filled in.
			expect(data as unknown).toEqual({
				idempotencyKey: 'mb-2026-07-08',
				category: 'editorial',
				priority: 'standard',
				content: {
					items: {
						lead: {
							type: 'newsletter',
							title: 'Your morning briefing',
							body: 'Today the world woke up to a historic summit.',
							link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
						},
					},
				},
				channels: [
					{
						channel: 'newsletter',
						audience: {
							type: 'segment',
							segments: [{ name: 'morning-briefing-subscribers' }],
						},
						compose: {
							layout: 'digest',
							items: ['lead'],
							subject: 'Your morning briefing',
						},
					},
				],
				sender: 'notifications-tooling-spa/v1',
				options: { dryRun: false, scheduledFor: null },
			});
		});

		it('accepts an app-push-notification push with a single content item', () => {
			const data = expectValid(pushRequest());

			expect(data as unknown).toEqual({
				idempotencyKey: 'push-2026-07-08',
				category: 'editorial',
				priority: 'standard',
				content: {
					items: {
						lead: {
							type: 'app-push-notification',
							title: 'Ukraine summit begins',
							body: 'World leaders gather in Geneva as talks open.',
							link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
						},
					},
				},
				channels: [
					{
						channel: 'app-push-notification',
						audience: {
							type: 'topic',
							topics: [{ type: 'breaking', name: 'uk' }],
						},
						compose: { use: 'lead' },
					},
				],
				sender: 'notifications-tooling-spa/v1',
				options: { dryRun: false, scheduledFor: null },
			});
		});

		it('accepts a combined newsletter + app-push request', () => {
			const data = expectValid(combinedRequest());

			// One request fans out to both channels, reusing the shared
			// `content.items` library by reference from each plan's `compose`.
			expect(data as unknown).toEqual({
				idempotencyKey: 'combined-2026-07-08',
				category: 'editorial',
				priority: 'standard',
				content: {
					items: {
						pushLead: {
							type: 'app-push-notification',
							title: 'Ukraine summit begins',
							body: 'World leaders gather in Geneva as talks open.',
							link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
						},
						newsLead: {
							type: 'newsletter',
							title: 'Your morning briefing',
							body: 'Today the world woke up to a historic summit.',
							link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
						},
					},
				},
				channels: [
					{
						channel: 'app-push-notification',
						audience: {
							type: 'topic',
							topics: [{ type: 'breaking', name: 'uk' }],
						},
						compose: { use: 'pushLead' },
					},
					{
						channel: 'newsletter',
						audience: {
							type: 'segment',
							segments: [{ name: 'morning-briefing-subscribers' }],
						},
						compose: {
							layout: 'digest',
							items: ['newsLead'],
							subject: 'Briefing',
						},
					},
				],
				sender: 'notifications-tooling-spa/v1',
				options: { dryRun: false, scheduledFor: null },
			});
		});
	});

	describe('idempotencyKey', () => {
		it('is accepted (present but not persisted/deduplicated)', () => {
			expect(
				expectValid(pushRequest({ idempotencyKey: 'abc' })).idempotencyKey,
			).toBe('abc');
		});

		it('is required', () => {
			expect(pathsOf(pushRequest({ idempotencyKey: undefined }))).toContain(
				'idempotencyKey',
			);
		});

		it('rejects an empty string', () => {
			expect(pathsOf(pushRequest({ idempotencyKey: '' }))).toContain(
				'idempotencyKey',
			);
		});
	});

	describe('category', () => {
		it('is required', () => {
			expect(pathsOf(pushRequest({ category: undefined }))).toContain(
				'category',
			);
		});

		it('rejects an empty string', () => {
			expect(pathsOf(pushRequest({ category: '' }))).toContain('category');
		});
	});

	describe('sender', () => {
		it('is required', () => {
			expect(pathsOf(pushRequest({ sender: undefined }))).toContain('sender');
		});

		it('rejects an empty string', () => {
			expect(pathsOf(pushRequest({ sender: '' }))).toContain('sender');
		});
	});

	describe('priority', () => {
		it('defaults to standard when omitted', () => {
			expect(expectValid(pushRequest()).priority).toBe('standard');
		});

		it('accepts high', () => {
			expect(expectValid(pushRequest({ priority: 'high' })).priority).toBe(
				'high',
			);
		});

		it('rejects an unknown priority', () => {
			expect(pathsOf(pushRequest({ priority: 'urgent' }))).toContain(
				'priority',
			);
		});
	});

	describe('options', () => {
		it('defaults the whole object when omitted', () => {
			expect(expectValid(pushRequest()).options).toEqual({
				dryRun: false,
				scheduledFor: null,
			});
		});

		it('accepts a dryRun flag and an ISO scheduledFor', () => {
			const data = expectValid(
				pushRequest({
					options: { dryRun: true, scheduledFor: '2026-07-08T09:00:00Z' },
				}),
			);
			expect(data.options).toEqual({
				dryRun: true,
				scheduledFor: '2026-07-08T09:00:00Z',
			});
		});

		it('allows scheduledFor to be null and defaults dryRun', () => {
			expect(
				expectValid(pushRequest({ options: { scheduledFor: null } })).options,
			).toEqual({ dryRun: false, scheduledFor: null });
		});

		it('rejects a non-ISO scheduledFor', () => {
			expect(
				pathsOf(pushRequest({ options: { scheduledFor: '8th July' } })),
			).toContain('options/scheduledFor');
		});

		it('rejects a non-boolean dryRun', () => {
			expect(pathsOf(pushRequest({ options: { dryRun: 'yes' } }))).toContain(
				'options/dryRun',
			);
		});
	});

	describe('content.items', () => {
		it('requires at least one item', () => {
			expect(
				pathsOf(pushRequest({ content: { items: {} } })).some((path) =>
					path.startsWith('content/items'),
				),
			).toBe(true);
		});

		it('rejects an empty item key', () => {
			expect(
				pathsOf(
					pushRequest({
						content: { items: { '': pushItem(), lead: pushItem() } },
					}),
				).some((path) => path.startsWith('content/items')),
			).toBe(true);
		});

		it('rejects a content item with an unknown channel type', () => {
			expect(
				pathsOf(pushRequestWithItem(pushItem({ type: 'sms' }))).some((path) =>
					path.startsWith('content/items/lead'),
				),
			).toBe(true);
		});
	});

	describe('app-push content item', () => {
		it('accepts a title at the limit', () => {
			expectValid(
				pushRequestWithItem(
					pushItem({ title: repeat(pushLimits.title.maxLength) }),
				),
			);
		});

		it('rejects a title over the limit', () => {
			expect(
				pathsOf(
					pushRequestWithItem(
						pushItem({ title: repeat(pushLimits.title.maxLength + 1) }),
					),
				),
			).toContain('content/items/lead/title');
		});

		it('rejects an empty title', () => {
			expect(pathsOf(pushRequestWithItem(pushItem({ title: '' })))).toContain(
				'content/items/lead/title',
			);
		});

		it('accepts a body at the limit', () => {
			expectValid(
				pushRequestWithItem(
					pushItem({ body: repeat(pushLimits.body.maxLength) }),
				),
			);
		});

		it('rejects a body over the limit', () => {
			expect(
				pathsOf(
					pushRequestWithItem(
						pushItem({ body: repeat(pushLimits.body.maxLength + 1) }),
					),
				),
			).toContain('content/items/lead/body');
		});

		it('rejects an empty body', () => {
			expect(pathsOf(pushRequestWithItem(pushItem({ body: '' })))).toContain(
				'content/items/lead/body',
			);
		});

		it('requires a link', () => {
			expect(
				pathsOf(pushRequestWithItem(pushItem({ link: undefined }))),
			).toContain('content/items/lead/link');
		});

		it('accepts optional image media', () => {
			expectValid(
				pushRequestWithItem(
					pushItem({
						media: { type: 'image', imageUrl: 'https://i.guim.co.uk/lead.jpg' },
					}),
				),
			);
		});

		it('accepts media with a thumbnail', () => {
			expectValid(
				pushRequestWithItem(
					pushItem({
						media: {
							type: 'image',
							imageUrl: 'https://i.guim.co.uk/lead.jpg',
							thumbnailUrl: 'https://i.guim.co.uk/thumb.jpg',
						},
					}),
				),
			);
		});
	});

	describe('newsletter content item', () => {
		it('accepts a title at the limit', () => {
			expectValid(
				newsletterRequestWithItem(
					newsletterItem({ title: repeat(newsletterLimits.title.maxLength) }),
				),
			);
		});

		it('rejects a title over the limit', () => {
			expect(
				pathsOf(
					newsletterRequestWithItem(
						newsletterItem({
							title: repeat(newsletterLimits.title.maxLength + 1),
						}),
					),
				),
			).toContain('content/items/lead/title');
		});

		it('accepts a body at the limit', () => {
			expectValid(
				newsletterRequestWithItem(
					newsletterItem({ body: repeat(newsletterLimits.body.maxLength) }),
				),
			);
		});

		it('rejects a body over the limit', () => {
			expect(
				pathsOf(
					newsletterRequestWithItem(
						newsletterItem({
							body: repeat(newsletterLimits.body.maxLength + 1),
						}),
					),
				),
			).toContain('content/items/lead/body');
		});

		it('applies the more generous newsletter title limit (vs push)', () => {
			// A title longer than the push limit but within the newsletter limit.
			expectValid(
				newsletterRequestWithItem(
					newsletterItem({ title: repeat(pushLimits.title.maxLength + 10) }),
				),
			);
		});
	});

	describe('guardian article link', () => {
		it.each([
			'https://www.theguardian.com/world/x',
			'https://theguardian.com/world/x',
			'https://amp.theguardian.com/world/x',
			'https://gu.com/p/xyz',
		])('accepts the Guardian URL %s', (link) => {
			expectValid(pushRequestWithItem(pushItem({ link })));
		});

		it.each([
			'http://www.theguardian.com/x', // not https
			'https://www.example.com/x', // not Guardian
			'https://faketheguardian.com/x', // look-alike host
			'https://theguardian.com.evil.com/x', // suffix spoof
			'not a url', // not a URL at all
		])('rejects the non-Guardian URL %s', (link) => {
			expect(pathsOf(pushRequestWithItem(pushItem({ link })))).toContain(
				'content/items/lead/link',
			);
		});
	});

	describe('media', () => {
		it('rejects a non-image media type', () => {
			expect(
				pathsOf(
					pushRequestWithItem(
						pushItem({
							media: { type: 'video', imageUrl: 'https://i.guim.co.uk/x.jpg' },
						}),
					),
				).some((path) => path.startsWith('content/items/lead/media')),
			).toBe(true);
		});

		it('requires an imageUrl', () => {
			expect(
				pathsOf(pushRequestWithItem(pushItem({ media: { type: 'image' } }))),
			).toContain('content/items/lead/media/imageUrl');
		});

		it('rejects a non-URL imageUrl', () => {
			expect(
				pathsOf(
					pushRequestWithItem(
						pushItem({ media: { type: 'image', imageUrl: 'nope' } }),
					),
				),
			).toContain('content/items/lead/media/imageUrl');
		});

		it('rejects a non-URL thumbnailUrl', () => {
			expect(
				pathsOf(
					pushRequestWithItem(
						pushItem({
							media: {
								type: 'image',
								imageUrl: 'https://i.guim.co.uk/x.jpg',
								thumbnailUrl: 'nope',
							},
						}),
					),
				),
			).toContain('content/items/lead/media/thumbnailUrl');
		});
	});

	describe('newsletter segment audience', () => {
		it('accepts every configured segment', () => {
			for (const name of NEWSLETTER_SEGMENTS) {
				expectValid(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: { type: 'segment', segments: [{ name }] },
						}),
					),
				);
			}
		});

		it('rejects an unknown segment', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: {
								type: 'segment',
								segments: [{ name: 'ghost-segment' }],
							},
						}),
					),
				),
			).toContain('channels/0/audience/segments/0/name');
		});

		it('requires at least one segment', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ audience: { type: 'segment', segments: [] } }),
					),
				),
			).toContain('channels/0/audience/segments');
		});
	});

	describe('push topic audience', () => {
		it('accepts every configured topic', () => {
			for (const topic of PUSH_TOPICS) {
				expectValid(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'topic',
								topics: [{ type: topic.type, name: topic.name }],
							},
						}),
					),
				);
			}
		});

		it('rejects an unknown topic name', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'topic',
								topics: [{ type: 'breaking', name: 'mars' }],
							},
						}),
					),
				),
			).toContain('channels/0/audience/topics/0');
		});

		it('rejects a known name under the wrong topic type', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'topic',
								topics: [{ type: 'newsstand', name: 'uk' }],
							},
						}),
					),
				),
			).toContain('channels/0/audience/topics/0');
		});

		it('requires at least one topic', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({ audience: { type: 'topic', topics: [] } }),
					),
				),
			).toContain('channels/0/audience/topics');
		});

		it(`rejects more than ${MAX_PUSH_TOPICS} topics`, () => {
			const topics = Array.from({ length: MAX_PUSH_TOPICS + 1 }, () => ({
				type: 'breaking',
				name: 'uk',
			}));
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({ audience: { type: 'topic', topics } }),
					),
				),
			).toContain('channels/0/audience/topics');
		});
	});

	describe('compose', () => {
		it('push requires a use reference', () => {
			expect(pathsOf(pushRequestWithPlan(pushPlan({ compose: {} })))).toContain(
				'channels/0/compose/use',
			);
		});

		it('push rejects an empty use', () => {
			expect(
				pathsOf(pushRequestWithPlan(pushPlan({ compose: { use: '' } }))),
			).toContain('channels/0/compose/use');
		});

		it('newsletter requires at least one item', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ compose: { items: [], subject: 'Briefing' } }),
					),
				),
			).toContain('channels/0/compose/items');
		});

		it('newsletter requires a subject', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ compose: { items: ['lead'] } }),
					),
				),
			).toContain('channels/0/compose/subject');
		});

		it('newsletter rejects a subject over the limit', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							compose: {
								items: ['lead'],
								subject: repeat(newsletterLimits.title.maxLength + 1),
							},
						}),
					),
				),
			).toContain('channels/0/compose/subject');
		});

		it('newsletter accepts the single layout', () => {
			expectValid(
				newsletterRequestWithPlan(
					newsletterPlan({
						compose: { items: ['lead'], subject: 'Briefing', layout: 'single' },
					}),
				),
			);
		});

		it('newsletter rejects an unknown layout', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							compose: { items: ['lead'], subject: 'Briefing', layout: 'grid' },
						}),
					),
				),
			).toContain('channels/0/compose/layout');
		});
	});

	describe('plan channel discrimination', () => {
		it('rejects an unknown channel', () => {
			expect(
				pathsOf(
					pushRequestWithPlan({
						channel: 'sms',
						audience: {
							type: 'topic',
							topics: [{ type: 'breaking', name: 'uk' }],
						},
						compose: { use: 'lead' },
					}),
				).some((path) => path.startsWith('channels/0')),
			).toBe(true);
		});

		it('rejects a push plan with a segment audience', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'segment',
								segments: [{ name: NEWSLETTER_SEGMENTS[0] }],
							},
						}),
					),
				).some((path) => path.startsWith('channels/0/audience')),
			).toBe(true);
		});

		it('rejects a newsletter plan with a topic audience', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: {
								type: 'topic',
								topics: [{ type: 'breaking', name: 'uk' }],
							},
						}),
					),
				).some((path) => path.startsWith('channels/0/audience')),
			).toBe(true);
		});

		it('rejects a push plan using newsletter-style compose', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({ compose: { items: ['lead'], subject: 'Briefing' } }),
					),
				),
			).toContain('channels/0/compose/use');
		});
	});

	describe('channels', () => {
		it('requires at least one channel', () => {
			expect(pathsOf(pushRequest({ channels: [] }))).toContain('channels');
		});
	});

	describe('compose references (cross-field superRefine)', () => {
		it('rejects a push plan referencing a missing item', () => {
			const issues = issuesOf(
				pushRequestWithPlan(pushPlan({ compose: { use: 'ghost' } })),
			);
			expect(issues.map((issue) => issue.path.join('/'))).toContain(
				'channels/0/compose/use',
			);
			expect(
				issues.some((issue) => issue.message.includes('not defined')),
			).toBe(true);
		});

		it('rejects a newsletter plan referencing a missing item', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							compose: { items: ['ghost'], subject: 'Briefing' },
						}),
					),
				),
			).toContain('channels/0/compose/items/0');
		});

		it('reports every missing reference in one pass', () => {
			const paths = pathsOf(
				newsletterRequestWithPlan(
					newsletterPlan({
						compose: { items: ['ghost-1', 'ghost-2'], subject: 'Briefing' },
					}),
				),
			);
			expect(paths).toContain('channels/0/compose/items/0');
			expect(paths).toContain('channels/0/compose/items/1');
		});

		it('rejects composing an item whose type does not match the channel', () => {
			// A newsletter plan composing a push-typed content item.
			const issues = issuesOf(
				newsletterRequest({
					content: { items: { lead: pushItem() } },
					channels: [
						newsletterPlan({
							compose: { items: ['lead'], subject: 'Briefing' },
						}),
					],
				}),
			);
			expect(issues.map((issue) => issue.path.join('/'))).toContain(
				'channels/0/compose/items/0',
			);
			expect(issues.some((issue) => issue.message.includes('has type'))).toBe(
				true,
			);
		});
	});
});

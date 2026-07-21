import {
	appPushNotificationSegmentIds,
	MAX_AUDIENCE_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	newsletterSegmentIds,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { describe, expect, it } from 'bun:test';
import { notificationSendRequestSchema } from './notification-send-request';

const pushLimits =
	notificationChannelContentLimits[NotificationChannel.AppPushNotification];
const newsletterLimits =
	notificationChannelContentLimits[NotificationChannel.Newsletter];

const guardianLink =
	'https://www.theguardian.com/world/2026/jul/08/ukraine-summit';

const repeat = (length: number) => 'a'.repeat(length);

// --- Fixture builders (each returns a fresh object; override via spread) ---

const pushItem = (overrides: Record<string, unknown> = {}) => ({
	type: NotificationChannel.AppPushNotification,
	title: 'Ukraine summit begins',
	body: 'World leaders gather in Geneva as talks open.',
	link: guardianLink,
	...overrides,
});

const newsletterItem = (overrides: Record<string, unknown> = {}) => ({
	type: NotificationChannel.Newsletter,
	title: 'Your morning briefing',
	body: 'Today the world woke up to a historic summit.',
	link: guardianLink,
	...overrides,
});

const pushPlan = (overrides: Record<string, unknown> = {}) => ({
	audience: { type: 'segment', items: ['breaking-news-uk'] },
	compose: { use: 'lead' },
	...overrides,
});

const newsletterPlan = (overrides: Record<string, unknown> = {}) => ({
	audience: { type: 'segment', items: ['morning-briefing'] },
	compose: { items: ['lead'], subject: 'Your morning briefing' },
	...overrides,
});

const pushRequest = (overrides: Record<string, unknown> = {}) => ({
	idempotencyKey: 'push-2026-07-08',
	category: 'editorial',
	sender: 'notifications-tooling-spa/v1',
	content: { items: { lead: pushItem() } },
	channels: { [NotificationChannel.AppPushNotification]: pushPlan() },
	...overrides,
});

const newsletterRequest = (overrides: Record<string, unknown> = {}) => ({
	idempotencyKey: 'mb-2026-07-08',
	category: 'editorial',
	sender: 'notifications-tooling-spa/v1',
	content: { items: { lead: newsletterItem() } },
	channels: { [NotificationChannel.Newsletter]: newsletterPlan() },
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
	channels: {
		[NotificationChannel.AppPushNotification]: pushPlan({
			compose: { use: 'pushLead' },
		}),
		[NotificationChannel.Newsletter]: newsletterPlan({
			compose: { items: ['newsLead'], subject: 'Briefing' },
		}),
	},
	...overrides,
});

const pushRequestWithItem = (item: Record<string, unknown>) =>
	pushRequest({ content: { items: { lead: item } } });

const newsletterRequestWithItem = (item: Record<string, unknown>) =>
	newsletterRequest({ content: { items: { lead: item } } });

const pushRequestWithPlan = (plan: Record<string, unknown>) =>
	pushRequest({
		channels: { [NotificationChannel.AppPushNotification]: plan },
	});

const newsletterRequestWithPlan = (plan: Record<string, unknown>) =>
	newsletterRequest({
		channels: { [NotificationChannel.Newsletter]: plan },
	});

// --- Assertion helpers ---

const parse = (input: unknown) =>
	notificationSendRequestSchema.safeParse(input);

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

describe('notificationSendRequestSchema', () => {
	describe('happy paths', () => {
		it('accepts a newsletter push with a single content item', () => {
			const data = expectValid(newsletterRequest());

			// The fully normalised payload, with request-level defaults
			// (`priority`, `options`) filled in.
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
				channels: {
					newsletter: {
						audience: {
							type: 'segment',
							items: ['morning-briefing'],
						},
						compose: {
							items: ['lead'],
							subject: 'Your morning briefing',
						},
					},
				},
				sender: 'notifications-tooling-spa/v1',
				options: { dryRun: false, scheduledFor: null },
			});
		});

		it('accepts an app-push push with a single content item', () => {
			const data = expectValid(pushRequest());

			expect(data as unknown).toEqual({
				idempotencyKey: 'push-2026-07-08',
				category: 'editorial',
				priority: 'standard',
				content: {
					items: {
						lead: {
							type: 'app-push',
							title: 'Ukraine summit begins',
							body: 'World leaders gather in Geneva as talks open.',
							link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
						},
					},
				},
				channels: {
					'app-push': {
						audience: {
							type: 'segment',
							items: ['breaking-news-uk'],
						},
						compose: { use: 'lead' },
					},
				},
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
							type: 'app-push',
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
				channels: {
					'app-push': {
						audience: {
							type: 'segment',
							items: ['breaking-news-uk'],
						},
						compose: { use: 'pushLead' },
					},
					newsletter: {
						audience: {
							type: 'segment',
							items: ['morning-briefing'],
						},
						compose: {
							items: ['newsLead'],
							subject: 'Briefing',
						},
					},
				},
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
		it('accepts every configured newsletter segment', () => {
			for (const id of newsletterSegmentIds) {
				expectValid(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: { type: 'segment', items: [id] },
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
							audience: { type: 'segment', items: ['ghost-segment'] },
						}),
					),
				),
			).toContain('channels/newsletter/audience/items/0');
		});

		it('rejects an app-push segment used on a newsletter plan', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: { type: 'segment', items: ['breaking-news-uk'] },
						}),
					),
				),
			).toContain('channels/newsletter/audience/items/0');
		});

		it('requires at least one segment', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ audience: { type: 'segment', items: [] } }),
					),
				),
			).toContain('channels/newsletter/audience/items');
		});

		it('rejects duplicate segments', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: {
								type: 'segment',
								items: ['morning-briefing', 'morning-briefing'],
							},
						}),
					),
				),
			).toContain('channels/newsletter/audience/items');
		});
	});

	describe('newsletter test email audience', () => {
		it('accepts a list of test email recipients', () => {
			expectValid(
				newsletterRequestWithPlan(
					newsletterPlan({
						audience: {
							type: 'email',
							items: ['newsletters.test@theguardian.com'],
						},
					}),
				),
			);
		});

		it('rejects an invalid email address', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: { type: 'email', items: ['not-an-email'] },
						}),
					),
				),
			).toContain('channels/newsletter/audience/items/0');
		});

		it('requires at least one recipient', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ audience: { type: 'email', items: [] } }),
					),
				),
			).toContain('channels/newsletter/audience/items');
		});

		it(`rejects more than ${MAX_TEST_EMAIL_RECIPIENTS} recipients`, () => {
			const emails = Array.from(
				{ length: MAX_TEST_EMAIL_RECIPIENTS + 1 },
				(_, index) => `test-${index}@theguardian.com`,
			);
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ audience: { type: 'email', items: emails } }),
					),
				),
			).toContain('channels/newsletter/audience/items');
		});

		it('rejects duplicate recipients', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							audience: {
								type: 'email',
								items: [
									'newsletters.test@theguardian.com',
									'newsletters.test@theguardian.com',
								],
							},
						}),
					),
				),
			).toContain('channels/newsletter/audience/items');
		});
	});

	describe('push segment audience', () => {
		it('accepts every configured app-push segment', () => {
			for (const id of appPushNotificationSegmentIds) {
				expectValid(
					pushRequestWithPlan(
						pushPlan({
							audience: { type: 'segment', items: [id] },
						}),
					),
				);
			}
		});

		it('rejects an unknown segment', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: { type: 'segment', items: ['ghost-segment'] },
						}),
					),
				),
			).toContain('channels/app-push/audience/items/0');
		});

		it('rejects a newsletter segment used on a push plan', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: { type: 'segment', items: ['morning-briefing'] },
						}),
					),
				),
			).toContain('channels/app-push/audience/items/0');
		});

		it('requires at least one segment', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({ audience: { type: 'segment', items: [] } }),
					),
				),
			).toContain('channels/app-push/audience/items');
		});

		it(`rejects more than ${MAX_AUDIENCE_SEGMENTS} segments`, () => {
			const segments = Array.from(
				{ length: MAX_AUDIENCE_SEGMENTS + 1 },
				() => 'breaking-news-uk',
			);
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({ audience: { type: 'segment', items: segments } }),
					),
				),
			).toContain('channels/app-push/audience/items');
		});

		it('rejects duplicate segments', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'segment',
								items: ['breaking-news-uk', 'breaking-news-uk'],
							},
						}),
					),
				),
			).toContain('channels/app-push/audience/items');
		});
	});

	describe('compose', () => {
		it('push requires a use reference', () => {
			expect(pathsOf(pushRequestWithPlan(pushPlan({ compose: {} })))).toContain(
				'channels/app-push/compose/use',
			);
		});

		it('push rejects an empty use', () => {
			expect(
				pathsOf(pushRequestWithPlan(pushPlan({ compose: { use: '' } }))),
			).toContain('channels/app-push/compose/use');
		});

		it('newsletter requires at least one item', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ compose: { items: [], subject: 'Briefing' } }),
					),
				),
			).toContain('channels/newsletter/compose/items');
		});

		it('newsletter rejects duplicate item ids', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({
							compose: { items: ['lead', 'lead'], subject: 'Briefing' },
						}),
					),
				),
			).toContain('channels/newsletter/compose/items');
		});

		it('newsletter requires a subject', () => {
			expect(
				pathsOf(
					newsletterRequestWithPlan(
						newsletterPlan({ compose: { items: ['lead'] } }),
					),
				),
			).toContain('channels/newsletter/compose/subject');
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
			).toContain('channels/newsletter/compose/subject');
		});
	});

	describe('plan channel discrimination', () => {
		it('rejects an unknown channel', () => {
			expect(
				pathsOf(
					pushRequest({
						channels: {
							sms: {
								audience: { type: 'segment', items: ['breaking-news-uk'] },
								compose: { use: 'lead' },
							},
						},
					}),
				).some((path) => path.startsWith('channels')),
			).toBe(true);
		});

		it('rejects a push plan with a test email audience', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'email',
								items: ['newsletters.test@theguardian.com'],
							},
						}),
					),
				).some((path) => path.startsWith('channels/app-push/audience')),
			).toBe(true);
		});

		it('rejects a newsletter plan with an unknown audience type', () => {
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
				).some((path) => path.startsWith('channels/newsletter/audience')),
			).toBe(true);
		});

		it('rejects a push plan using newsletter-style compose', () => {
			expect(
				pathsOf(
					pushRequestWithPlan(
						pushPlan({ compose: { items: ['lead'], subject: 'Briefing' } }),
					),
				),
			).toContain('channels/app-push/compose/use');
		});
	});

	describe('channels', () => {
		it('requires at least one channel', () => {
			expect(pathsOf(pushRequest({ channels: {} }))).toContain('channels');
		});
	});

	describe('compose references (cross-field superRefine)', () => {
		it('rejects a push plan referencing a missing item', () => {
			const issues = issuesOf(
				pushRequestWithPlan(pushPlan({ compose: { use: 'ghost' } })),
			);
			expect(issues.map((issue) => issue.path.join('/'))).toContain(
				'channels/app-push/compose/use',
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
			).toContain('channels/newsletter/compose/items/0');
		});

		it('reports every missing reference in one pass', () => {
			const paths = pathsOf(
				newsletterRequestWithPlan(
					newsletterPlan({
						compose: { items: ['ghost-1', 'ghost-2'], subject: 'Briefing' },
					}),
				),
			);
			expect(paths).toContain('channels/newsletter/compose/items/0');
			expect(paths).toContain('channels/newsletter/compose/items/1');
		});

		it('rejects composing an item whose type does not match the channel', () => {
			// A newsletter plan composing a push-typed content item.
			const issues = issuesOf(
				newsletterRequest({
					content: { items: { lead: pushItem() } },
					channels: {
						newsletter: newsletterPlan({
							compose: { items: ['lead'], subject: 'Briefing' },
						}),
					},
				}),
			);
			expect(issues.map((issue) => issue.path.join('/'))).toContain(
				'channels/newsletter/compose/items/0',
			);
			expect(issues.some((issue) => issue.message.includes('has type'))).toBe(
				true,
			);
		});
	});

	describe('strict keys (rejects unsupported properties)', () => {
		const unrecognizedKeyPaths = (input: unknown) =>
			issuesOf(input)
				.filter((issue) => issue.code === 'unrecognized_keys')
				.map((issue) => issue.path.join('/'));

		it('rejects an unknown top-level key', () => {
			expect(unrecognizedKeyPaths(pushRequest({ surprise: true }))).toContain(
				'',
			);
		});

		it('rejects an unknown key on a content item', () => {
			expect(
				unrecognizedKeyPaths(pushRequestWithItem(pushItem({ surprise: true }))),
			).toContain('content/items/lead');
		});

		it('rejects an unknown key on an audience', () => {
			expect(
				unrecognizedKeyPaths(
					pushRequestWithPlan(
						pushPlan({
							audience: {
								type: 'segment',
								items: ['breaking-news-uk'],
								surprise: true,
							},
						}),
					),
				),
			).toContain('channels/app-push/audience');
		});

		it('rejects an unknown key on a compose', () => {
			expect(
				unrecognizedKeyPaths(
					pushRequestWithPlan(
						pushPlan({ compose: { use: 'lead', surprise: true } }),
					),
				),
			).toContain('channels/app-push/compose');
		});

		it('rejects an unknown key on a plan', () => {
			expect(
				unrecognizedKeyPaths(pushRequestWithPlan(pushPlan({ surprise: true }))),
			).toContain('channels/app-push');
		});

		it('rejects an unknown key on options', () => {
			expect(
				unrecognizedKeyPaths(
					pushRequest({
						options: { dryRun: false, scheduledFor: null, surprise: true },
					}),
				),
			).toContain('options');
		});
	});
});

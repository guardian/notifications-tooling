import { z } from 'zod';

/**
 * Presentation-only kicker choice from `CreateNotificationForm`. It drives the
 * local HTML preview only: no request builder exists yet, and the backend
 * contract has no field to carry it, so nothing sends it downstream. Whoever
 * wires the send will need a backend field before this can be represented.
 * See CONTEXT.md.
 */
export const kickerSchema = z.enum(['breaking-news', 'exclusive', 'none']);
export type Kicker = z.infer<typeof kickerSchema>;

const newsletterContentItemSchema = z.strictObject({
	type: z.literal('newsletter'),
	title: z.string(),
	body: z.string(),
	link: z.string(),
});

export const sendNotificationRequestSchema = z.strictObject({
	idempotencyKey: z.string(),
	content: z.strictObject({
		items: z.record(z.string(), newsletterContentItemSchema),
	}),
	channels: z.strictObject({
		newsletter: z.strictObject({
			audience: z.strictObject({
				type: z.literal('segment'),
				items: z.array(z.string()),
			}),
			compose: z.strictObject({
				items: z.array(z.string()),
				subject: z.string(),
			}),
		}),
	}),
	sender: z.string(),
	options: z.strictObject({
		dryRun: z.literal(true),
		scheduledFor: z.null(),
	}),
});
export type SendNotificationRequest = z.infer<
	typeof sendNotificationRequestSchema
>;

/**
 * The three limits that apply to one text field. Hand-written to mirror
 * `@config`'s `ContentFieldLimits` rather than imported from it: the frontend
 * ships to a browser and must not take a dependency on a backend workspace.
 * `channels.contract.test.ts` in the backend guards the two against drift.
 *
 * The UI drives its counters from `recommended` and `editorialLimit` only.
 * `validationCap` is the length the broker rejects past — wiring it to a
 * counter would erase the editorial guidance the counter exists to show.
 */
const contentFieldLimitsSchema = z.object({
	recommended: z.number(),
	editorialLimit: z.number(),
	validationCap: z.number(),
});
export type ContentFieldLimits = z.infer<typeof contentFieldLimitsSchema>;

const channelContentLimitsSchema = z.object({
	title: contentFieldLimitsSchema,
	body: contentFieldLimitsSchema,
});

/**
 * `GET /v1/channels/constraints`. Non-strict throughout, so the backend can add
 * a channel, a field, or an audience cap without breaking a deployed SPA — the
 * client only fails on something it asked for going missing or changing type.
 */
export const channelConstraintsResponseSchema = z.object({
	channels: z.object({
		newsletter: z.object({
			content: channelContentLimitsSchema,
			compose: z.object({
				minItems: z.number().int().nonnegative(),
				maxItems: z.number().int().positive(),
				subject: contentFieldLimitsSchema,
			}),
			audience: z.object({
				maxSegments: z.number().int().positive(),
				maxTestRecipients: z.number().int().positive(),
			}),
		}),
		'app-push': z.object({
			content: channelContentLimitsSchema,
			compose: z.object({
				minItems: z.number().int().nonnegative(),
				maxItems: z.number().int().positive(),
			}),
			audience: z.object({
				maxSegments: z.number().int().positive(),
			}),
		}),
	}),
});
export type ChannelConstraintsResponse = z.infer<
	typeof channelConstraintsResponseSchema
>;

export const sendNotificationResponseSchema = z.strictObject({
	notificationId: z.string(),
	status: z.literal('accepted'),
	plans: z.array(
		z.strictObject({
			channel: z.enum(['newsletter', 'app-push']),
			planId: z.string(),
			status: z.literal('accepted'),
		}),
	),
	statusUrl: z.string(),
	cancellable: z.strictObject({
		cancelUrl: z.string(),
		expiresAt: z.number().int(),
	}),
});
export type SendNotificationResponse = z.infer<
	typeof sendNotificationResponseSchema
>;

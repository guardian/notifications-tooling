import { z } from 'zod';

/**
 * Presentation-only kicker choice from `CreateNotificationForm`. Not
 * repurposed as `category` (see Decision 12 in the plan).
 */
export const kickerSchema = z.enum(['breaking-news', 'exclusive', 'none']);
export type Kicker = z.infer<typeof kickerSchema>;

export const CATEGORY = 'editorial';

const composeSchema = z.object({
	articleUrl: z.string(),
	kicker: kickerSchema,
	subject: z.string(),
	previewText: z.string(),
});

const newsletterContentItemSchema = z.strictObject({
	type: z.literal('newsletter'),
	title: z.string(),
	body: z.string(),
	link: z.string(),
});

export const sendNotificationRequestSchema = z.strictObject({
	idempotencyKey: z.string(),
	category: z.literal(CATEGORY),
	priority: z.literal('standard'),
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

/** Request body for the mocked preview/render endpoint. */
export const previewRequestSchema = composeSchema;
export type PreviewRequest = z.infer<typeof previewRequestSchema>;

/** `HtmlPreviewLoader.fetchHtml` expects this shape from the JSON client. */
export const previewResponseSchema = z.object({ html: z.string() });
export type PreviewResponse = z.infer<typeof previewResponseSchema>;

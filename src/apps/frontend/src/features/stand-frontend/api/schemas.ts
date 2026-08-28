import { z } from 'zod';

/** Presentation choice composed into the newsletter subject by the client. */
export const kickerSchema = z.enum(['breaking-news', 'exclusive', 'none']);
export type Kicker = z.infer<typeof kickerSchema>;

const baseContentItemShape = z.strictObject({
	title: z.string(),
	body: z.string(),
	link: z.string(),
});

const newsletterContentItemSchema = z.strictObject({
	...baseContentItemShape.shape,
	type: z.literal('newsletter'),
});

const appPushContentItemSchema = z.strictObject({
	...baseContentItemShape.shape,
	type: z.literal('app-push'),
	media: z
		.strictObject({
			type: z.literal('image'),
			imageUrl: z.string(),
			thumbnailUrl: z.string().optional(),
		})
		.optional(),
});

const requestBaseShape = {
	idempotencyKey: z.string(),
	sender: z.string(),
	options: z.strictObject({
		dryRun: z.boolean(),
		scheduledFor: z.null(),
	}),
};

const newsletterSendRequestSchema = z.strictObject({
	...requestBaseShape,
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
});

const appPushSendRequestSchema = z.strictObject({
	...requestBaseShape,
	content: z.strictObject({
		items: z.record(z.string(), appPushContentItemSchema),
	}),
	channels: z.strictObject({
		'app-push': z.strictObject({
			audience: z.strictObject({
				type: z.literal('topic'),
				items: z.array(
					z.strictObject({
						type: z.string(),
						name: z.string(),
					}),
				),
			}),
			compose: z.strictObject({
				use: z.string(),
			}),
		}),
	}),
});

export const sendNotificationRequestSchema = z.union([
	newsletterSendRequestSchema,
	appPushSendRequestSchema,
]);
export type SendNotificationRequest = z.infer<
	typeof sendNotificationRequestSchema
>;

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
				maxTopics: z.number().int().positive(),
			}),
		}),
	}),
});
export type ChannelConstraintsResponse = z.infer<
	typeof channelConstraintsResponseSchema
>;

const editionOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
});

const topicTypeOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
	editions: editionOptionSchema.array(),
});
export type TopicTypeOption = z.infer<typeof topicTypeOptionSchema>;

/**
 * `GET /v1/channels/audiences`. Non-strict throughout, so the backend can add
 * a channel, a field, or an audience cap without breaking a deployed SPA — the
 * client only fails on something it asked for going missing or changing type.
 */
export const channelAudienceResponseSchema = z.object({
	channels: z
		.object({
			newsletter: z
				.object({
					segments: z.array(
						z.object({
							id: z.string(),
							label: z.string(),
						}),
					),
				})
				.loose(),
			'app-push': z
				.object({
					topicTypes: topicTypeOptionSchema.array(),
				})
				.loose(),
		})
		.loose(),
});
export type ChannelAudienceResponse = z.infer<
	typeof channelAudienceResponseSchema
>;

export const notificationDispatchSchema = z.strictObject({
	id: z.string(),
	channel: z.enum(['newsletter', 'app-push']),
	target: z.string(),
	status: z.enum(['success', 'failure']),
	providerRef: z.string().nullable(),
	failureReason: z.string().nullable(),
	providerStatusCode: z.number().int().nullable(),
	detail: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type NotificationDispatch = z.infer<typeof notificationDispatchSchema>;

/**
 * The stored notification resource returned by both `POST /v1/notifications`
 * and `POST /v1/notification-tests`: envelope fields plus the per-target
 * dispatch outcomes. `status` is rolled up from those outcomes.
 */
export const notificationResourceSchema = z.strictObject({
	id: z.string(),
	idempotencyKey: z.string(),
	kind: z.enum(['send', 'test']),
	status: z.enum(['accepted', 'delivered', 'partially_delivered', 'failed']),
	sender: z.string(),
	createdByEmail: z.string(),
	dryRun: z.boolean(),
	scheduledFor: z.string().nullable(),
	content: z.record(z.string(), z.unknown()),
	channels: z.record(z.string(), z.unknown()),
	createdAt: z.string(),
	updatedAt: z.string(),
	dispatches: notificationDispatchSchema.array(),
});
export type NotificationResource = z.infer<typeof notificationResourceSchema>;

export const sendNotificationResponseSchema = notificationResourceSchema;
export type SendNotificationResponse = z.infer<
	typeof sendNotificationResponseSchema
>;

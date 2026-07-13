import { z } from 'zod';

// Supported delivery channels. Kept in one place so audience/compose rules can
// reference the same source of truth.
export const CHANNELS = ['push', 'newsletter'] as const;

// --- WHAT: the channel-neutral content library ------------------------------

const linkSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('guardianContent'),
		contentApiId: z.string().min(1),
	}),
	z.object({
		type: z.literal('external'),
		url: z.url(),
	}),
]);

const mediaSchema = z.object({
	type: z.literal('image'),
	imageUrl: z.url(),
	thumbnailUrl: z.url().optional(),
});

const contentItemSchema = z.object({
	title: z.string().min(1),
	body: z.string().min(1),
	link: linkSchema.optional(),
	media: mediaSchema.optional(),
});

// A library of reusable, named items (e.g. "lead", "secondary", "opinion").
const contentSchema = z.object({
	items: z.record(z.string().min(1), contentItemSchema),
});

// --- WHERE: audience targeting ---------------------------------------------

const topicSchema = z.object({
	type: z.string().min(1),
	name: z.string().min(1),
});

const segmentSchema = z.object({
	name: z.string().min(1),
});

const deviceRecipientSchema = z.object({
	deviceToken: z.string().min(1),
	platform: z.enum(['ios', 'android']),
});

const emailRecipientSchema = z.object({
	email: z.email(),
});

const testRecipientSchema = z.union([
	deviceRecipientSchema,
	emailRecipientSchema,
]);

const audienceSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('topic'),
		// mobile-n10n allows 1–20 topics per push.
		topics: z.array(topicSchema).min(1).max(20),
	}),
	z.object({
		type: z.literal('segment'),
		segments: z.array(segmentSchema).min(1),
	}),
	z.object({
		type: z.literal('userId'),
		userIds: z.array(z.string().min(1)).min(1),
	}),
	z.object({
		type: z.literal('test'),
		recipients: z.array(testRecipientSchema).min(1),
	}),
]);

// --- WHERE: per-channel plans ----------------------------------------------

const importanceSchema = z.enum(['Major', 'Minor']);

// Push takes a single item, selected by name via `use`.
const pushComposeSchema = z.object({
	use: z.string().min(1),
});

// Newsletter assembles many items into a layout.
const newsletterComposeSchema = z.object({
	layout: z.string().min(1),
	items: z.array(z.string().min(1)).min(1),
	subject: z.string().min(1).max(120),
});

const pushPlanSchema = z.object({
	channel: z.literal('push'),
	audience: audienceSchema,
	compose: pushComposeSchema,
	overrides: z
		.object({
			importance: importanceSchema,
		})
		.optional(),
});

const newsletterPlanSchema = z.object({
	channel: z.literal('newsletter'),
	audience: audienceSchema,
	compose: newsletterComposeSchema,
});

const channelPlanSchema = z.discriminatedUnion('channel', [
	pushPlanSchema,
	newsletterPlanSchema,
]);

// --- Options ----------------------------------------------------------------

const optionsSchema = z.object({
	dryRun: z.boolean().default(false),
	scheduledFor: z.iso.datetime().nullable().default(null),
});

// --- Request body (consumed by express-zod-safe as a field shape) -----------

export const bodySchema = {
	idempotencyKey: z.string().min(1),
	category: z.string().min(1),
	priority: z.string().min(1),
	content: contentSchema,
	channels: z.array(channelPlanSchema).min(1),
	options: optionsSchema.optional(),
	sender: z.string().min(1),
};

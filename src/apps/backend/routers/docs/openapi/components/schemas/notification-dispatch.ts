/**
 * One persisted downstream provider call for a notification — a single
 * mobile-n10n push per app-push topic type, or a single Braze campaign per
 * newsletter segment. Referenced via `#/components/schemas/NotificationDispatch`.
 */
export const notificationDispatchSchema = {
	type: 'object',
	required: [
		'id',
		'channel',
		'target',
		'providerRef',
		'status',
		'failureReason',
		'providerStatusCode',
		'detail',
		'createdAt',
		'updatedAt',
	],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
			description: 'The dispatch record id.',
		},
		channel: { $ref: '#/components/schemas/NotificationChannel' },
		target: {
			type: 'string',
			description:
				'The unit this call addressed: for app-push, the topic type and the editions it went to, joined as `topicType/edition,edition`; for newsletter, the segment id.',
			example: 'breaking-news/uk,us',
		},
		providerRef: {
			type: ['string', 'null'],
			description:
				'The provider-side reference (mobile-n10n POST id or Braze dispatch id), if the call reached the provider.',
		},
		status: {
			type: 'string',
			description: 'Whether the downstream call succeeded.',
			enum: ['success', 'failure'],
		},
		failureReason: {
			type: ['string', 'null'],
			description: 'A safe explanation of the failure when status is failure.',
		},
		providerStatusCode: {
			type: ['integer', 'null'],
			description:
				"The provider's HTTP status when a failed call reached it (null for a success, timeout, or network error).",
			example: 502,
		},
		detail: {
			type: ['object', 'null'],
			description:
				'Channel-specific extras: for app-push, the `topics` sent to mobile-n10n and the `importance`; for newsletter, the Braze `campaignId` and the `emailRenderingId`.',
			additionalProperties: true,
			example: {
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Major',
			},
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
			description: 'When the dispatch outcome was first recorded.',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
			description: 'When the dispatch outcome was last updated by a retry.',
		},
	},
} as const;

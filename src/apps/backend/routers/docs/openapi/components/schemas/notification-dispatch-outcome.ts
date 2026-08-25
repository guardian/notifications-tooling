/**
 * One persisted downstream dispatch outcome exposed within a `202 Accepted`
 * notification response — one entry per targeted mobile-n10n topic type or
 * Braze newsletter segment. Referenced via
 * `#/components/schemas/NotificationDispatchOutcome`.
 */
export const notificationDispatchOutcomeSchema = {
	type: 'object',
	required: ['id', 'channel', 'target', 'status'],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
			description: 'The stored dispatch id.',
		},
		channel: { $ref: '#/components/schemas/NotificationChannel' },
		target: {
			type: 'string',
			description:
				'The unit the call addressed: an app-push topic type or a newsletter segment/variant id.',
			example: 'breaking-news',
		},
		status: {
			type: 'string',
			enum: ['success', 'failure'],
			description: 'Whether the downstream provider call succeeded.',
		},
		providerRef: {
			type: ['string', 'null'],
			description:
				'The mobile-n10n POST id or Braze dispatch id for the call, when available.',
		},
		failureReason: {
			type: ['string', 'null'],
			description: 'A short reason code when the call failed, otherwise null.',
		},
		providerStatusCode: {
			type: ['integer', 'null'],
			description:
				"The provider's HTTP status when a failed call reached it, otherwise null.",
		},
	},
} as const;

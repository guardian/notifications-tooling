/**
 * One persisted downstream provider call for a notification — a single
 * mobile-n10n push per app-push topic type, or a single Braze campaign per
 * newsletter segment. `requested` records what the API consumer asked for and
 * `resolved` what it mapped to downstream, side by side. Referenced via
 * `#/components/schemas/NotificationDispatch`.
 */
export const notificationDispatchSchema = {
	type: 'object',
	required: [
		'id',
		'channel',
		'requested',
		'resolved',
		'providerRef',
		'status',
		'failureReason',
		'providerStatusCode',
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
		requested: {
			type: 'object',
			description:
				'The audience unit the API consumer asked for. For app-push, the topic type and its editions; for newsletter, the segment.',
			oneOf: [
				{
					type: 'object',
					required: ['channel', 'topicType', 'editions'],
					properties: {
						channel: { type: 'string', enum: ['app-push'] },
						topicType: { type: 'string', example: 'breaking-news' },
						editions: {
							type: 'array',
							items: { type: 'string' },
							example: ['uk', 'us'],
						},
					},
				},
				{
					type: 'object',
					required: ['channel', 'segment'],
					properties: {
						channel: { type: 'string', enum: ['newsletter'] },
						segment: { type: 'string', example: 'morning-briefing-uk' },
					},
				},
			],
		},
		resolved: {
			type: 'object',
			description:
				'The final values sent to the provider. For app-push, the mobile-n10n topics and importance; for newsletter, the Braze campaign and email-rendering ids.',
			oneOf: [
				{
					type: 'object',
					required: ['channel', 'topics', 'importance'],
					properties: {
						channel: { type: 'string', enum: ['app-push'] },
						topics: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									type: { type: 'string' },
									name: { type: 'string' },
								},
							},
							example: [{ type: 'breaking', name: 'uk' }],
						},
						importance: { type: 'string', enum: ['Major', 'Minor'] },
						blockId: {
							type: 'string',
							description:
								'The liveblog block the push deep-links into, present only when the article link named one.',
							example: '5dd7ca0f8f080fd59fb15354',
						},
					},
				},
				{
					type: 'object',
					required: ['channel', 'emailRenderingId'],
					properties: {
						channel: { type: 'string', enum: ['newsletter'] },
						brazeCampaignId: { type: 'string', example: 'braze-campaign-1' },
						emailRenderingId: { type: 'string', example: 'briefing-uk' },
					},
				},
			],
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

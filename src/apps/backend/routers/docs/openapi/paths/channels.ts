/** The `/v1/channels/constraints` path item. */
export const channelsConstraintsPath = {
	get: {
		summary: 'Retrieve per-channel validation rules',
		description:
			'Returns the per-channel content limits, compose shape and audience caps the SPA uses to drive its UI (character counters, layout pickers, topic limits).',
		responses: {
			'200': {
				description: 'The per-channel validation rules.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ChannelConstraints' },
					},
				},
			},
		},
	},
} as const;

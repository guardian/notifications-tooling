/** The `/v1/channels/constraints` path item. */
export const channelsConstraintsPath = {
	get: {
		summary: 'Retrieve per-channel validation rules',
		description:
			'Returns the per-channel content limits, compose shape and audience caps the SPA uses to drive its UI (character counters, item and segment limits).',
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

/** The `/v1/channels/audiences` path item. */
export const channelsAudiencesPath = {
	get: {
		summary: 'Retrieve per-channel audience segments',
		description:
			'Returns the selectable audience segments (id + label) per channel the SPA uses to populate its audience pickers.',
		responses: {
			'200': {
				description: 'The per-channel audience segments.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ChannelAudiences' },
					},
				},
			},
		},
	},
} as const;

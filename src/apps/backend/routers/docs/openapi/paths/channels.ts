/** The `/v1/channels/constraints` path item. */
export const channelsConstraintsPath = {
	get: {
		summary: 'Retrieve per-channel content limits and caps',
		description:
			'Returns the per-channel content limits, compose shape and audience caps the SPA uses to drive its UI. Each text field carries three limits: `recommended` and `editorialLimit` are editorial guidance the SPA renders and this service does not enforce; only `validationCap` is enforced, on POST /v1/notifications.',
		security: [{ pandaCookie: [] }],
		responses: {
			'200': {
				description: 'The per-channel limits and caps.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ChannelConstraints' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
		},
	},
} as const;

/** The `/v1/channels/audiences` path item. */
export const channelsAudiencesPath = {
	get: {
		summary: 'Retrieve per-channel audience segments',
		description:
			'Returns the selectable audience segments (id + label) per channel the SPA uses to populate its audience pickers.',
		security: [{ pandaCookie: [] }],
		responses: {
			'200': {
				description: 'The per-channel audience segments.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ChannelAudiences' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
		},
	},
} as const;

/** The `/v1/channels/config/emai` path item. */
export const emailConfigPath = {
	get: {
		summary: 'Retrieve per-channel email config',
		description:
			'Returns the config with the segment ID and newsletter ID for each email channel. Intended for trouble-shooting and confirming the correct config is in place.',
		security: [{ pandaCookie: [] }],
		responses: {
			'200': {
				description: 'The per-channel email config.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/EmailChannelConfig' },
						examples: {
							newsletter: {
								$ref: '#/components/examples/EmailChannelConfig',
							},
						},
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
		},
	},
} as const;

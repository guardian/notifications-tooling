/**
 * The per-channel acceptance record within a `202 Accepted` notification
 * response — one entry per requested delivery channel. Referenced via
 * `#/components/schemas/NotificationPlanAcceptance`.
 */
export const notificationPlanAcceptanceSchema = {
	type: 'object',
	required: ['channel', 'planId', 'status'],
	properties: {
		channel: { $ref: '#/components/schemas/NotificationChannel' },
		planId: {
			type: 'string',
			example: '<notificationId>#newsletter',
		},
		status: { type: 'string', enum: ['accepted'] },
	},
} as const;

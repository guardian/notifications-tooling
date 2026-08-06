export const notificationUnprocessableErrorSchema = {
	oneOf: [
		{ $ref: '#/components/schemas/NotificationValidationError' },
		{ $ref: '#/components/schemas/EmailRenderingContentError' },
	],
} as const;

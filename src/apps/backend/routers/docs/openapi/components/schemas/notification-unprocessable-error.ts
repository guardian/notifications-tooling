export const notificationUnprocessableErrorSchema = {
	oneOf: [
		{ $ref: '#/components/schemas/NotificationValidationError' },
		{ $ref: '#/components/schemas/EmailRenderingContentError' },
		{ $ref: '#/components/schemas/BrazePushRecipientError' },
	],
} as const;

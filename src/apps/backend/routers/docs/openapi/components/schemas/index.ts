import { acceptedNotificationSchema } from './accepted-notification';
import { validationErrorSchema } from './validation-error';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	AcceptedNotification: acceptedNotificationSchema,
	ValidationError: validationErrorSchema,
} as const;

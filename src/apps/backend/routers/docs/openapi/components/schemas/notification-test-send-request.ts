import { z } from 'zod';
import { notificationTestSendRequestSchema } from '../../../../notifications/schemas/notification-send-request';

/** The test-send request schema, generated from the runtime Zod validator. */
export const notificationTestSendRequestJsonSchema = z.toJSONSchema(
	notificationTestSendRequestSchema,
	{ target: 'draft-2020-12', io: 'input' },
);

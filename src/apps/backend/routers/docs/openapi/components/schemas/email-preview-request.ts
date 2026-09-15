import { emailPreviewRequestSchema } from '@models';
import { z } from 'zod';

/** The `POST /v1/preview/email` request body. */
export const emailPreviewRequestJsonSchema = z.toJSONSchema(
	emailPreviewRequestSchema,
	{ target: 'draft-2020-12', io: 'input' },
);

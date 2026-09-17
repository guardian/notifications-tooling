import { emailPreviewResponseSchema } from '@models';
import { z } from 'zod';

/** The successful `POST /v1/preview/email` response body. */
export const emailPreviewResponseJsonSchema = z.toJSONSchema(
	emailPreviewResponseSchema,
	{ target: 'draft-2020-12', io: 'output' },
);

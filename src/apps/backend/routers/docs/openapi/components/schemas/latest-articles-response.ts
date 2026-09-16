import { latestArticlesResponseSchema } from '@models';
import { z } from 'zod';

/** The successful `GET /v1/content/articles/latest` response body. */
export const latestArticlesResponseJsonSchema = z.toJSONSchema(
	latestArticlesResponseSchema,
	{ target: 'draft-2020-12', io: 'output' },
);

import { latestArticleSchema } from '@models';
import { z } from 'zod';

/** An article returned by `GET /v1/content/articles/latest`. */
export const latestArticleJsonSchema = z.toJSONSchema(latestArticleSchema, {
	target: 'draft-2020-12',
	io: 'output',
});

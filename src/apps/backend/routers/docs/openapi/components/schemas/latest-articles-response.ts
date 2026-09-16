import { latestArticleSchema, latestArticlesResponseSchema } from '@models';
import { z } from 'zod';

/** The successful `GET /v1/content/articles/latest` response body. */
export const latestArticlesResponseJsonSchema = z.toJSONSchema(
	latestArticlesResponseSchema,
	{
		target: 'draft-2020-12',
		io: 'output',
		override: ({ zodSchema, jsonSchema }) => {
			if (zodSchema === latestArticleSchema) {
				for (const key of Object.keys(jsonSchema)) {
					delete jsonSchema[key];
				}
				Object.assign(jsonSchema, {
					$ref: '#/components/schemas/LatestArticle',
				});
			}
		},
	},
);

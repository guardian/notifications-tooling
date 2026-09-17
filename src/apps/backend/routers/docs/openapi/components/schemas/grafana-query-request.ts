import { z } from 'zod';
import { grafanaQueryRequestSchema } from '../../../../grafana/grafana-query-request';

/**
 * The `POST /grafana/query` request body, derived directly from the Zod
 * validation schema so the docs stay in sync with what the API accepts.
 * Registered as a named component and referenced via
 * `#/components/schemas/GrafanaQueryRequest`.
 */
export const grafanaQueryRequestJsonSchema = z.toJSONSchema(
	grafanaQueryRequestSchema,
	{ target: 'draft-2020-12', io: 'input' },
);

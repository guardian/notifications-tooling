import { components } from './components';
import { info } from './info';
import { paths } from './paths';

/**
 * The OpenAPI 3.0 document served by Swagger UI at `/docs/api`.
 *
 * The document is assembled from focused modules — {@link info}, {@link paths}
 * and {@link components} — so each concern can be maintained in isolation.
 */
export const openApiDocument = {
	openapi: '3.0.3',
	info,
	paths,
	components,
} as const;

import { examples } from './examples';
import { responses } from './responses';
import { schemas } from './schemas';
import { securitySchemes } from './security-schemes';

/** The reusable `components` block of the OpenAPI document. */
export const components = {
	schemas,
	responses,
	examples,
	securitySchemes,
} as const;

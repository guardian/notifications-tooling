import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../../api/config';
import type { ChannelConstraintsResponse } from '../../features/stand-frontend/api/schemas';

/**
 * Mirrors what `@config` currently serves. Typed as the response so a contract
 * change that the schema accepts but this fixture does not will fail to
 * compile, rather than leaving stories mocking a shape the backend dropped.
 */
export const channelConstraints: ChannelConstraintsResponse = {
	channels: {
		newsletter: {
			content: {
				title: { recommended: 46, editorialLimit: 70, validationCap: 150 },
				body: { recommended: 85, editorialLimit: 140, validationCap: 250 },
			},
			compose: {
				minItems: 1,
				maxItems: 1,
				subject: { recommended: 46, editorialLimit: 70, validationCap: 150 },
			},
			audience: { maxSegments: 20, maxTestRecipients: 20 },
		},
		'app-push': {
			content: {
				title: { recommended: 50, editorialLimit: 50, validationCap: 50 },
				body: { recommended: 120, editorialLimit: 120, validationCap: 120 },
			},
			compose: { minItems: 1, maxItems: 1 },
			audience: { maxTopics: 20 },
		},
	},
};

export const channelConstraintsHandler = http.get(
	`${getApiBaseUrl()}/v1/channels/constraints`,
	() => HttpResponse.json(channelConstraints),
);

/** For exercising the silent fallback to hardcoded limits. */
export const channelConstraintsFailureHandler = http.get(
	`${getApiBaseUrl()}/v1/channels/constraints`,
	() => HttpResponse.json({ error: 'internal_error' }, { status: 500 }),
);

export const channelHandlers = [channelConstraintsHandler];

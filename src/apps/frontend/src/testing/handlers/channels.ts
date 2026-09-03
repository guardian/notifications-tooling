import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../../api-client/config';
import type {
	ChannelAudienceResponse,
	ChannelConstraintsResponse,
} from '../../schemas';

/**
 * Mirrors what `@config` currently serves. Typed as the response so a contract
 * change that the schema accepts but this fixture does not will fail to
 * compile, rather than leaving stories mocking a shape the backend dropped.
 */
export const channelConstraints: ChannelConstraintsResponse = {
	channels: {
		newsletter: {
			content: {
				title: { recommended: 46, editorialLimit: 70 },
				body: { recommended: 85, editorialLimit: 140 },
			},
			compose: {
				minItems: 1,
				maxItems: 1,
				subject: { recommended: 46, editorialLimit: 70 },
			},
			audience: { maxSegments: 20, maxTestRecipients: 20 },
		},
		'app-push': {
			content: {
				title: { recommended: 50, editorialLimit: 50, validationCap: 50 },
				body: { recommended: 90, editorialLimit: 120 },
			},
			compose: {
				minItems: 1,
				maxItems: 1,
			},
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

export const channelAudiences: ChannelAudienceResponse = {
	channels: {
		newsletter: {
			segments: [
				{ id: 'UK', label: 'United Kingdom' },
				{ id: 'US', label: 'United States' },
			],
		},
		'app-push': {
			topicTypes: [
				{
					id: 'breaking-news',
					label: 'Breaking news',
					editions: [
						{ id: 'uk', label: 'UK' },
						{ id: 'us', label: 'US' },
					],
				},
			],
		},
	},
};

export const channelAudiencesHandler = http.get(
	`${getApiBaseUrl()}/v1/channels/audiences`,
	() => HttpResponse.json(channelAudiences),
);

export const channelHandlers = [
	channelConstraintsHandler,
	channelAudiencesHandler,
];

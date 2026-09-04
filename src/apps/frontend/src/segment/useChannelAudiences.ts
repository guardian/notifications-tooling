import {
	type AppAlertTopicOption,
	type ChannelAudienceResponse,
	channelAudienceResponseSchema,
} from '@models';
import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirectToLogin';
import { FALLBACK_TOPIC_TYPES } from './audience-fallbacks';

export const channelAudiencesQueryKey = ['channels', 'audience'] as const;

/**
 * Reads the per-channel constraints the backend derives from the same config it
 * validates sends against, so the UI's guidance cannot drift from the rules.
 *
 * Failure is deliberately not surfaced: callers read
 * {@link NEWSLETTER_LIMIT_FALLBACKS} when `data` is absent.
 */
export const useChannelAudiences = () =>
	useQuery<ChannelAudienceResponse>({
		queryKey: channelAudiencesQueryKey,
		queryFn: async () => {
			try {
				return await fetchJsonAndParse(
					channelAudienceResponseSchema,
					'/v1/channels/audiences',
				);
			} catch (error) {
				// This read runs at mount, before an editor has composed
				// anything, so bouncing straight to login costs no work. The
				// redirect lives here rather than in `fetchJsonAndParse` so that
				// call sites which *do* hold unsaved work — the send, once it is
				// wired up — cannot inherit it by accident.
				// See docs/ADRs/login-redirect-ownership.md.
				if (
					error instanceof ApiError &&
					error.failure === 'unauthenticated' &&
					error.loginUrl
				) {
					redirectToLogin(error.loginUrl);
				}
				throw error;
			}
		},
		// Limits are editorial config that changes on a deploy cadence, not per
		// session, so refetching them on every mount is pure noise.
		staleTime: Infinity,
	});

/**
 * The curated app-push topic types from the backend.
 *
 * While the query is in flight or if it failed we fall back to
 * {@link FALLBACK_TOPIC_TYPES}.
 */
export const useAppPushTopicTypes = (): AppAlertTopicOption[] => {
	const { data: audiences } = useChannelAudiences();
	return audiences?.channels['app-push'].topicTypes ?? FALLBACK_TOPIC_TYPES;
};

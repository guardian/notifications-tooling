import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../../../api/client';
import { ApiError } from '../../../api/errors';
import { redirectToLogin } from '../../../api/redirectToLogin';
import { editionIds } from '../edition-values';
import type { ChannelAudienceResponse, TopicTypeOption } from './schemas';
import { channelAudienceResponseSchema } from './schemas';

export const channelAudiencesQueryKey = ['channels', 'audience'] as const;

export const FALLBACK_TOPIC_TYPES: TopicTypeOption[] = [
	{
		id: 'breaking-news',
		label: 'Breaking news',
		editions: [
			{ id: editionIds.UK, label: 'UK' },
			{ id: editionIds.US, label: 'US' },
			{ id: editionIds.AU, label: 'AU' },
			{ id: editionIds.INT, label: 'International' },
			{ id: editionIds.EU, label: 'Europe' },
		],
	},
];

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

import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../../../api/client';
import {
	type ChannelConstraintsResponse,
	channelConstraintsResponseSchema,
} from './schemas';

/**
 * The limits the UI falls back to when `GET /v1/channels/constraints` cannot be
 * read.
 */
export const NEWSLETTER_LIMIT_FALLBACKS = {
	title: { recommended: 46, editorialLimit: 70 },
	body: { recommended: 85, editorialLimit: 140 },
} as const;

export const channelConstraintsQueryKey = ['channels', 'constraints'] as const;

/**
 * Reads the per-channel constraints the backend derives from the same config it
 * validates sends against, so the UI's guidance cannot drift from the rules.
 *
 * Failure is deliberately not surfaced: callers read
 * {@link NEWSLETTER_LIMIT_FALLBACKS} when `data` is absent.
 */
export const useChannelConstraints = () =>
	useQuery<ChannelConstraintsResponse>({
		queryKey: channelConstraintsQueryKey,
		queryFn: () =>
			fetchJsonAndParse(
				channelConstraintsResponseSchema,
				'/v1/channels/constraints',
			),
		// Limits are editorial config that changes on a deploy cadence, not per
		// session, so refetching them on every mount is pure noise.
		staleTime: Infinity,
	});

import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../../../api/client';
import {
	type ChannelConstraintsResponse,
	channelConstraintsResponseSchema,
} from './schemas';

/**
 * The limits the UI falls back to when `GET /v1/channels/constraints` cannot be
 * read. They duplicate the newsletter numbers in `@config` on purpose: a failed
 * read must leave the editor with working character counters rather than blank
 * ones, so the counters degrade to the last known-good guidance instead of
 * disappearing.
 *
 * Only the two limits the UI actually renders are duplicated. `validationCap`
 * is deliberately absent — the backend is the only thing that enforces it, and
 * a stale copy here would be a second source of truth for a number the UI never
 * shows.
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
 * {@link NEWSLETTER_LIMIT_FALLBACKS} when `data` is absent. That makes a read
 * failure invisible to the editor, which is the intended trade — see
 * `docs/ADRs/content-limits.md`.
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

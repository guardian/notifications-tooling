import type { DispatchRequested, DispatchResolved } from '@database';
import type {
	AppNotificationFailureReason,
	BrazeFailureReason,
	EmailRenderingFailureReason,
} from '@services';

/**
 * The result of one downstream provider call, recorded the same way for every
 * channel. `requested` is the audience unit the API consumer asked for;
 * `resolved` is the final values actually sent to the provider — kept side by
 * side so it is always clear what came in and what it mapped to.
 */
type DispatchResult = {
	status: 'success' | 'failure';
	/** The provider-side reference: a mobile-n10n POST id or a Braze dispatch id. */
	providerRef: string | null;
	/** The provider's HTTP status when a failed call reached it. */
	providerStatusCode: number | null;
};

/** Pairs the requested and resolved targets for one channel by their discriminant. */
type Targets<C extends DispatchRequested['channel']> = {
	requested: Extract<DispatchRequested, { channel: C }>;
	resolved: Extract<DispatchResolved, { channel: C }>;
};

/** One mobile-n10n push: one per requested topic type, covering its editions. */
export type AppPushDispatchOutcome = DispatchResult &
	Targets<'app-push'> & {
		failureReason: AppNotificationFailureReason | 'unknown' | null;
	};

/** One Braze send: one per requested newsletter segment. */
export type NewsletterDispatchOutcome = DispatchResult &
	Targets<'newsletter'> & {
		failureReason:
			BrazeFailureReason | EmailRenderingFailureReason | 'unknown' | null;
	};

/**
 * One provider call's outcome. `requested`/`resolved` are self-describing and
 * discriminated by channel, so the same shape flows from dispatch through
 * persistence to the API.
 */
export type DispatchOutcome =
	AppPushDispatchOutcome | NewsletterDispatchOutcome;

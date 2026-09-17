import { describe, expect, it } from 'bun:test';
import { ApiError } from '../api-client/errors';
import type { SendNotificationRequest } from '../schemas';
import { articleFixture } from '../testing/capi-fixtures';
import {
	defaultAppAlertComposerState,
	defaultComposerState,
	notificationComposerReducer,
} from './notification-composer-reducer';

const pendingRequest: SendNotificationRequest = {
	idempotencyKey: 'send-operation-id',
	sender: 'dispatch-app',
	options: { dryRun: false, scheduledFor: null },
	content: { items: {} },
	channels: {
		newsletter: {
			audience: { type: 'segment', items: ['UK'] },
			compose: { items: [], subject: 'Subject' },
		},
	},
};

describe('notificationComposerReducer article lifecycle', () => {
	it('stores the imported article and completes loading', () => {
		const state = notificationComposerReducer(
			{ ...defaultComposerState, isFetchingArticle: true },
			{
				type: 'receive-article',
				article: articleFixture,
			},
		);

		expect(state).toMatchObject({
			article: articleFixture,
			fetchedArticleId: articleFixture.id,
			isFetchingArticle: false,
		});
	});

	it('clears stale article content when fetching an article fails', () => {
		const state = notificationComposerReducer(
			{
				...defaultComposerState,
				article: articleFixture,
				isFetchingArticle: true,
			},
			{
				type: 'report-article-error',
				errorMessage: 'Article not found',
			},
		);

		expect(state).toMatchObject({
			article: undefined,
			fetchedArticleId: undefined,
			isFetchingArticle: false,
			fetchArticleError: 'Article not found',
		});
	});
});

describe('notificationComposerReducer send lifecycle', () => {
	it('opens send confirmation with the prepared request without sending', () => {
		const state = notificationComposerReducer(defaultComposerState, {
			type: 'prepare-send',
			request: pendingRequest,
		});

		expect(state).toEqual({
			...defaultComposerState,
			isSendConfirmationOpen: true,
			pendingRequest,
		});
		expect(defaultComposerState.isSendConfirmationOpen).toBe(false);
	});

	it('closes send confirmation without discarding the prepared request', () => {
		const state = notificationComposerReducer(
			{
				...defaultComposerState,
				isSendConfirmationOpen: true,
				pendingRequest,
			},
			{ type: 'set-send-confirmation-open', isOpen: false },
		);

		expect(state).toEqual({
			...defaultComposerState,
			pendingRequest,
		});
	});

	it('stores only failure data when a send fails', () => {
		const failure = new ApiError({
			failure: 'fetch-fail',
			message: 'Network unavailable',
		});

		const state = notificationComposerReducer(
			{
				...defaultComposerState,
				isSendConfirmationOpen: true,
				isWaitingForSend: true,
			},
			{ type: 'receive-send-failure', failure },
		);

		expect(state).toMatchObject({
			isSendConfirmationOpen: false,
			isWaitingForSend: false,
			sendFailure: failure,
		});
	});

	it('clears transient notification state after a successful send', () => {
		const state = notificationComposerReducer(
			{
				...defaultComposerState,
				article: articleFixture,
				fetchedArticleId: articleFixture.id,
				isSendConfirmationOpen: true,
				isWaitingForSend: true,
			},
			{ type: 'complete-send' },
		);

		expect(state).toEqual(defaultComposerState);
	});
});

describe('notificationComposerReducer reset lifecycle', () => {
	it.each(['reset-newsletter-email', 'reset-app-alert'] as const)(
		'%s preserves an in-flight article import or send',
		(type) => {
			for (const busyState of [
				{ isFetchingArticle: true },
				{ isWaitingForSend: true },
			]) {
				const state = {
					...defaultComposerState,
					article: articleFixture,
					...busyState,
				};

				expect(notificationComposerReducer(state, { type })).toEqual(state);
			}
		},
	);

	it.each([
		['reset-newsletter-email', defaultComposerState],
		['reset-app-alert', defaultAppAlertComposerState],
	] as const)('%s clears an idle composer', (type, initialState) => {
		expect(
			notificationComposerReducer(
				{ ...initialState, article: articleFixture, pendingRequest },
				{ type },
			),
		).toEqual(initialState);
	});
});

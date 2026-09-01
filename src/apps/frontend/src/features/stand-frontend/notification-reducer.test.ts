import { describe, expect, it } from 'bun:test';
import { articleFixture } from '../../mocks/capi-fixtures';
import { defaultState, notificationReducer } from './notification-reducer';

describe('notificationReducer article lifecycle', () => {
	it('stores the imported article and completes loading', () => {
		const state = notificationReducer(
			{ ...defaultState, isFetchingContent: true },
			{
				type: 'receive-article',
				content: articleFixture,
			},
		);

		expect(state).toMatchObject({
			content: articleFixture,
			fetchedArticleId: articleFixture.id,
			isFetchingContent: false,
		});
	});

	it('clears stale article content when fetching an article fails', () => {
		const state = notificationReducer(
			{ ...defaultState, content: articleFixture, isFetchingContent: true },
			{
				type: 'report-article-error',
				errorMessage: 'Article not found',
			},
		);

		expect(state).toMatchObject({
			content: undefined,
			fetchedArticleId: undefined,
			isFetchingContent: false,
			fetchArticleError: 'Article not found',
		});
	});
});

describe('notificationReducer send lifecycle', () => {
	it('clears transient notification state after a successful send', () => {
		const state = notificationReducer(
			{
				...defaultState,
				content: articleFixture,
				fetchedArticleId: articleFixture.id,
				confirmSendModalOpen: true,
				isWaitingForSend: true,
			},
			{ type: 'complete-send' },
		);

		expect(state).toEqual(defaultState);
	});
});

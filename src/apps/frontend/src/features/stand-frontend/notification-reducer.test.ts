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

	it('disables and restores the current article thumbnail', () => {
		const disabledState = notificationReducer(
			{ ...defaultState, content: articleFixture },
			{
				type: 'set-thumbnail-image',
				contentId: articleFixture.id,
				thumbnail: '',
			},
		);

		expect(disabledState.content?.fields?.thumbnail).toBe('');

		const restoredState = notificationReducer(disabledState, {
			type: 'set-thumbnail-image',
			contentId: articleFixture.id,
			thumbnail: articleFixture.fields?.thumbnail ?? '',
		});

		expect(restoredState.content?.fields?.thumbnail).toBe(
			articleFixture.fields?.thumbnail,
		);
	});

	it('ignores thumbnail updates for a stale article', () => {
		const state = notificationReducer(
			{ ...defaultState, content: articleFixture },
			{
				type: 'set-thumbnail-image',
				contentId: 'different/article',
				thumbnail: '',
			},
		);

		expect(state.content).toEqual(articleFixture);
	});
});

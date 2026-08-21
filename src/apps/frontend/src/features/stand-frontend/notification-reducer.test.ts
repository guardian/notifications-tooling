import { describe, expect, it } from 'bun:test';
import { articleFixture } from '../../mocks/capi-fixtures';
import { defaultState, notificationReducer } from './notification-reducer';

describe('notificationReducer receive-article', () => {
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
});

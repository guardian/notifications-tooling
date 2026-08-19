import { describe, expect, it } from 'bun:test';
import type { ResolvedArticle } from '@models';
import '../../../happydom-setup';
import { articleFixture } from '../../mocks/capi-fixtures';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from './notification-reducer';

const articleWithStandfirst = (standfirst?: string): ResolvedArticle =>
	standfirst
		? {
				...articleFixture,
				fields: {
					...articleFixture.fields,
					standfirst,
				},
			}
		: {
				...articleFixture,
			};

const receiveArticle = (standfirst?: string, preview?: string) =>
	notificationReducer(
		{
			...defaultState,
			parameters: {
				...defaultState.parameters,
				type: 'email',
				preview,
			},
		},
		{
			type: 'receive-article',
			content: articleWithStandfirst(standfirst),
		},
	);

describe('notificationReducer receive-article', () => {
	it('uses the article headline as the default app-alert headline', () => {
		const state = notificationReducer(defaultAppAlertState, {
			type: 'receive-article',
			content: articleFixture,
		});

		expect(state.parameters).toMatchObject({
			type: 'push',
			headline: articleFixture.fields?.headline,
		});
	});

	it('uses the article web title when no headline field is returned', () => {
		const state = notificationReducer(defaultAppAlertState, {
			type: 'receive-article',
			content: { ...articleFixture, fields: undefined },
		});

		expect(state.parameters).toMatchObject({
			type: 'push',
			headline: articleFixture.webTitle,
		});
	});

	it('imports linked standfirst text without link formatting', () => {
		const state = receiveArticle(
			'<p>Read the <a href="https://example.com">full analysis</a> today.</p>',
		);

		expect(state.parameters).toMatchObject({
			type: 'email',
			preview: 'Read the full analysis today.',
		});
	});

	it('flattens paragraph and line breaks into spaces', () => {
		const state = receiveArticle(
			'<p>First paragraph.</p><p>Second<br>line.</p>',
		);

		expect(state.parameters).toMatchObject({
			type: 'email',
			preview: 'First paragraph. Second line.',
		});
	});

	it('normalizes repeated whitespace', () => {
		const state = receiveArticle('<p>First   second</p>\n<p>Third</p>');

		expect(state.parameters).toMatchObject({
			type: 'email',
			preview: 'First second Third',
		});
	});

	it('does not overwrite existing preview text with an empty standfirst', () => {
		const state = receiveArticle('<p>  </p>', 'Existing preview');

		expect(state.parameters).toMatchObject({
			type: 'email',
			preview: 'Existing preview',
		});
	});
});

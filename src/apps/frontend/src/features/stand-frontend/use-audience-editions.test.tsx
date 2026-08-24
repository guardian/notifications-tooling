import { describe, expect, it, mock } from 'bun:test';
import { beforeEach } from 'node:test';
import { act } from '@testing-library/react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { ChannelAudienceResponse } from './api/schemas';
import type { ChannelOption } from './types';

const FALLBACK_EDITIONS = [
	{ id: 'UK', label: 'United Kingdom' },
	{ id: 'US', label: 'United States' },
	{ id: 'AU', label: 'Australia' },
];

const TEST_NEWSLETTER_SEGMENTS = [
	{ id: 'MARS', label: 'The red planet' },
	{ id: 'JUPITER', label: 'The biggest planet' },
	{ id: 'SATURN', label: 'The one with rings' },
];

const TEST_PUSH_TOPIC = {
	id: 'joke-for-today',
	label: 'a daily regional joke',
	editions: [
		{
			id: 'yorkshire',
			label: 'Jokes for Yorkshire',
		},
		{
			id: 'dublin',
			label: 'Jokes for Dubliners.',
		},
	],
};

const testData: ChannelAudienceResponse = {
	channels: {
		newsletter: {
			segments: TEST_NEWSLETTER_SEGMENTS,
		},
		'app-push': {
			topicTypes: [TEST_PUSH_TOPIC],
		},
	},
};

const testResponse: { data?: ChannelAudienceResponse } = { data: testData };

const useChannelAudiences = mock(() => testResponse);

void mock.module('./api/useChannelAudiences', () => ({
	FALLBACK_EDITIONS,
	useChannelAudiences,
}));

const { useAudienceEditions } = await import('./use-audience-editions');

type TestComponentProps = { channel: ChannelOption; topicId?: string };
const TestComponent = ({ channel, topicId }: TestComponentProps) => {
	const editions = useAudienceEditions(channel, topicId);
	return createElement(
		'output',
		{ 'data-testid': 'editions' },
		JSON.stringify(editions),
	);
};

describe('useAudienceEditions', () => {
	beforeEach(() => {
		testResponse.data = testData;
	});

	const renderTestComponent = (props: TestComponentProps) => {
		const container = document.createElement('div');
		document.body.append(container);
		const root = createRoot(container);

		act(() => {
			root.render(createElement(TestComponent, props));
		});
		const output: unknown = JSON.parse(
			container.querySelector('[data-testid="editions"]')?.textContent ??
				'null',
		);

		const cleanUp = () => {
			act(() => {
				root.unmount();
				container.remove();
			});
		};

		return { output, cleanUp };
	};

	it('when asked for email, can get the email segments', () => {
		const { output, cleanUp } = renderTestComponent({
			channel: 'email',
		});

		expect(output).toEqual(TEST_NEWSLETTER_SEGMENTS);

		cleanUp();
	});
	it('when asked for email, returns the fallback if data is unset', () => {
		testResponse.data = undefined;
		const { output, cleanUp } = renderTestComponent({
			channel: 'email',
		});

		expect(output).toEqual(FALLBACK_EDITIONS);

		cleanUp();
	});
	it('when asked for push data without a topic id, returns the fallback', () => {
		const { output, cleanUp } = renderTestComponent({
			channel: 'push',
		});

		expect(output).toEqual(FALLBACK_EDITIONS);

		cleanUp();
	});
	it('when asked for push data with a topic id not in the data, returns the fallback', () => {
		const { output, cleanUp } = renderTestComponent({
			channel: 'push',
			topicId: 'not a topic',
		});

		expect(output).toEqual(FALLBACK_EDITIONS);

		cleanUp();
	});
	it('when asked for push data with a matching topic id not in the data, returns the editions for that topic', () => {
		const { output, cleanUp } = renderTestComponent({
			channel: 'push',
			topicId: TEST_PUSH_TOPIC.id,
		});
		expect(output).toEqual(TEST_PUSH_TOPIC.editions);

		cleanUp();
	});
	it('when asked for push data with a topic but the data is undefined, returns the fallback', () => {
		testResponse.data = undefined;
		const { output, cleanUp } = renderTestComponent({
			channel: 'push',
			topicId: TEST_PUSH_TOPIC.id,
		});
		expect(output).toEqual(FALLBACK_EDITIONS);

		cleanUp();
	});
});

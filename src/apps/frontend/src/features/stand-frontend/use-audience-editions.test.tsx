import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { ChannelAudienceResponse } from '@models';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../happydom-setup';
import { EDITION_OPTIONS } from './components/EditionOptions';
import {
	FALLBACK_SEGMENT_OPTIONS,
	useNewsletterSegmentOptions,
	useTopicEditionOptions,
} from './use-audience-editions';

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
			id: 'uk',
			label: 'Jokes for the United Kingdom',
		},
		{
			id: 'europe',
			label: 'European jokes',
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
} as ChannelAudienceResponse;

const testResponse: { data?: ChannelAudienceResponse } = { data: testData };

const useChannelAudiences = mock(() => testResponse);

void mock.module('./api/useChannelAudiences', () => ({
	useChannelAudiences,
}));

type TopicEditionsTestComponentProps = { topicId: string };
const TopicEditionsTestComponent = ({
	topicId,
}: TopicEditionsTestComponentProps) => {
	const editions = useTopicEditionOptions(topicId);
	return createElement(
		'output',
		{ 'data-testid': 'editions' },
		JSON.stringify(editions),
	);
};

describe('useTopicEditionOptions', () => {
	beforeEach(() => {
		testResponse.data = testData;
	});

	const renderTestComponent = (props: TopicEditionsTestComponentProps) => {
		const container = document.createElement('div');
		document.body.append(container);
		const root = createRoot(container);

		act(() => {
			root.render(createElement(TopicEditionsTestComponent, props));
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

	it('when asked for push data with a topic id not in the data, returns the fallback', () => {
		const { output, cleanUp } = renderTestComponent({
			topicId: 'not a topic',
		});

		expect(output).toEqual(EDITION_OPTIONS);

		cleanUp();
	});
	it('when asked for push data with a matching topic id not in the data, returns the editions for that topic', () => {
		const { output, cleanUp } = renderTestComponent({
			topicId: TEST_PUSH_TOPIC.id,
		});
		expect(output).toEqual([
			{
				code: 'UK',
				label: 'Jokes for the United Kingdom',
			},
			{
				code: 'EU',
				label: 'European jokes',
			},
		]);

		cleanUp();
	});
	it('when asked for push data with a topic but the data is undefined, returns the fallback', () => {
		testResponse.data = undefined;
		const { output, cleanUp } = renderTestComponent({
			topicId: TEST_PUSH_TOPIC.id,
		});
		expect(output).toEqual(EDITION_OPTIONS);

		cleanUp();
	});
});

const NewsletterSegmentOptionsTestComponent = () => {
	const editions = useNewsletterSegmentOptions();
	return createElement(
		'output',
		{ 'data-testid': 'editions' },
		JSON.stringify(editions),
	);
};

describe('useNewsletterSegmentOptions', () => {
	beforeEach(() => {
		testResponse.data = testData;
	});

	const renderTestComponent = () => {
		const container = document.createElement('div');
		document.body.append(container);
		const root = createRoot(container);

		act(() => {
			root.render(createElement(NewsletterSegmentOptionsTestComponent));
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

	it('returns the newsletter segment options, based on the audience data', () => {
		const { output, cleanUp } = renderTestComponent();

		expect(output).toEqual(
			TEST_NEWSLETTER_SEGMENTS.map(({ id, label }) => ({ code: id, label })),
		);
		cleanUp();
	});

	it('returns the fallback segment options if no audience data was available', () => {
		testResponse.data = undefined;
		const { output, cleanUp } = renderTestComponent();

		expect(output).toEqual(FALLBACK_SEGMENT_OPTIONS);
		cleanUp();
	});
});

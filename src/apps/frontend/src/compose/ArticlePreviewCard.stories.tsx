import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import {
	articleFixture,
	liveblogFixture,
	requestedLiveblogBlock,
} from '../testing/capi-fixtures';
import { ArticlePreviewCard } from './ArticlePreviewCard';

const meta = {
	title: 'Dispatch/Compose/ArticlePreviewCard',
	component: ArticlePreviewCard,
	parameters: {
		docs: {
			description: {
				component:
					'Preview of an article imported from CAPI, showing its section, pillar, headline and thumbnail.',
			},
		},
	},
} satisfies Meta<typeof ArticlePreviewCard>;

export default meta;
type PreviewCardStory = StoryObj<typeof meta>;

const publicationDate = (millisecondsAgo: number): string =>
	new Date(Date.now() - millisecondsAgo).toISOString();

export const WithThumbnail: PreviewCardStory = {
	args: {
		article: articleFixture,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText(
				(_, element) => element?.textContent === 'Environment / News',
			),
		).toBeInTheDocument();
		await expect(
			canvas.getByText('A rhyme to recall rising temperatures'),
		).toBeInTheDocument();
		await expect(
			canvas.getByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).toBeInTheDocument();
	},
};

export const Liveblog: PreviewCardStory = {
	args: {
		article: liveblogFixture,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const liveIndicator = canvas.getByText('Live');
		await expect(liveIndicator).toBeInTheDocument();
		await expect(
			liveIndicator.querySelector('[aria-hidden="true"]'),
		).toBeInTheDocument();
		await expect(
			canvas.getByText('Liveblog block ID: liveblog-main-block-id'),
		).toBeInTheDocument();
		await expect(canvas.getByText('Latest developments')).toBeInTheDocument();
		await expect(
			canvas.getByText((_, element) =>
				/^Updated \d+m ago$/.test(element?.textContent ?? ''),
			),
		).toBeInTheDocument();
		await expect(canvas.getByRole('time')).toHaveAttribute(
			'datetime',
			liveblogFixture.fields?.lastModified,
		);
		const image = canvas.getByAltText<HTMLImageElement>(
			'Latest liveblog update',
		);
		await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
	},
};

export const RequestedLiveblogBlock: PreviewCardStory = {
	args: {
		article: liveblogFixture,
		requestedUrl: `${liveblogFixture.webUrl}?filterKeyEvents=false#${requestedLiveblogBlock.id}`,
		requestedBlock: requestedLiveblogBlock,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText(`Liveblog block ID: ${requestedLiveblogBlock.id}`),
		).toBeInTheDocument();
		const articleLink = canvas.getByRole('link', {
			name: new RegExp(`${requestedLiveblogBlock.id}.*opens in a new tab`),
		});
		await expect(articleLink).toHaveAttribute(
			'href',
			expect.stringContaining(`#${requestedLiveblogBlock.id}`),
		);
		await expect(canvas.getByAltText('Latest liveblog update')).toHaveAttribute(
			'src',
			'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
		);
	},
};

export const JustPublished: PreviewCardStory = {
	args: {
		article: {
			...articleFixture,
			webPublicationDate: publicationDate(2 * 60 * 1000),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText(
				(_, element) => element?.textContent === 'Published 2m ago',
			),
		).toBeInTheDocument();
	},
};

export const WithoutThumbnail: PreviewCardStory = {
	args: {
		article: {
			...articleFixture,
			fields: { ...articleFixture.fields, thumbnail: '' },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('A rhyme to recall rising temperatures'),
		).toBeInTheDocument();
		await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
	},
};

export const HiddenThumbnail: PreviewCardStory = {
	args: {
		article: articleFixture,
		showThumbnail: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('A rhyme to recall rising temperatures'),
		).toBeInTheDocument();
		await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
	},
};

export const WithoutHeadlineField: PreviewCardStory = {
	args: {
		article: { ...articleFixture, fields: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(articleFixture.webTitle)).toBeInTheDocument();
	},
};

export const PublishedLongAgo: PreviewCardStory = {
	args: {
		article: {
			...articleFixture,
			webPublicationDate: publicationDate(30 * 24 * 60 * 60 * 1000),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByRole('time')).toHaveTextContent(
			/^\d{1,2} \w{3} \d{4}.+\d{2}:\d{2}$/,
		);
	},
};

export const WithoutPublicationDate: PreviewCardStory = {
	args: {
		article: { ...articleFixture, webPublicationDate: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByText(/^Published/)).not.toBeInTheDocument();
	},
};

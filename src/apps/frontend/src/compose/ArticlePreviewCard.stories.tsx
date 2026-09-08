import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import {
	articleFixture,
	liveblogFixture,
	requestedLiveblogBlock,
} from '../testing/capi-fixtures';
import { ArticlePreviewCard } from './ArticlePreviewCard';

const meta = {
	title: 'Stand Frontend/ArticlePreviewCard',
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

const publicationDate = (minsAgo: number): string =>
	new Date(Date.now() - minsAgo).toISOString();

export const WithThumbnail: PreviewCardStory = {
	args: {
		content: articleFixture,
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
		content: liveblogFixture,
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
		content: liveblogFixture,
		requestedUrl: `${liveblogFixture.webUrl}?filterKeyEvents=false#${requestedLiveblogBlock.id}`,
		requestedBlock: requestedLiveblogBlock,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText(`Liveblog block ID: ${requestedLiveblogBlock.id}`),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', { name: new RegExp(requestedLiveblogBlock.id) }),
		).toHaveAttribute(
			'href',
			expect.stringContaining(`#${requestedLiveblogBlock.id}`),
		);
		await expect(
			canvas.getByAltText('Requested liveblog update'),
		).toHaveAttribute(
			'src',
			'https://media.guim.co.uk/requested-liveblog-block/500.jpg',
		);
	},
};

export const LiveblogWithoutBlockImageAssets: PreviewCardStory = {
	args: {
		content: {
			...liveblogFixture,
			blocks: {
				main: {
					...liveblogFixture.blocks?.main,
					elements: [
						{
							type: 'image',
							imageTypeData: { alt: 'Latest liveblog update' },
						},
					],
				},
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByAltText('Latest liveblog update')).toHaveAttribute(
			'src',
			liveblogFixture.fields?.thumbnail,
		);
	},
};

export const JustPublished: PreviewCardStory = {
	args: {
		content: {
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
		content: {
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
		content: articleFixture,
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
		content: { ...articleFixture, fields: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(articleFixture.webTitle)).toBeInTheDocument();
	},
};

export const PublishedLongAgo: PreviewCardStory = {
	args: {
		content: {
			...articleFixture,
			webPublicationDate: publicationDate(30 * 24 * 60 * 60 * 1000),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText((_, element) =>
				/^Published \d{1,2} \w{3} \d{4}$/.test(element?.textContent ?? ''),
			),
		).toBeInTheDocument();
	},
};

export const WithoutPublicationDate: PreviewCardStory = {
	args: {
		content: { ...articleFixture, webPublicationDate: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByText(/^Published/)).not.toBeInTheDocument();
	},
};

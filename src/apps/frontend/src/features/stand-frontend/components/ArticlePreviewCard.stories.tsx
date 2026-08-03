import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
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

export const WithoutThumbnail: PreviewCardStory = {
	args: {
		content: {
			...articleFixture,
			fields: { ...articleFixture.fields, thumbnail: undefined },
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

export const WithoutHeadlineField: PreviewCardStory = {
	args: {
		content: { ...articleFixture, fields: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(articleFixture.webTitle)).toBeInTheDocument();
	},
};

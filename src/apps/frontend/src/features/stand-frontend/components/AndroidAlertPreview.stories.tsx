import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { AndroidAlertPreview } from './AndroidAlertPreview';

const meta = {
	title: 'Stand Frontend/AndroidAlertPreview',
	component: AndroidAlertPreview,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'An Android-style app alert preview showing the alert type, headline and article thumbnail.',
			},
		},
	},
} satisfies Meta<typeof AndroidAlertPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByLabelText('Android notification preview'),
		).toBeVisible();
		await expect(canvas.getByText('Android')).toBeVisible();
		await expect(canvas.getByText('Breaking news')).toBeVisible();
		await expect(
			canvas.getByAltText('Android article thumbnail'),
		).toBeVisible();
	},
};

export const WithArticleContent: Story = {
	args: {
		alertType: 'Environment',
		headline: articleFixture.fields?.headline,
		thumbnailUrl: articleFixture.fields?.thumbnail,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Environment')).toBeVisible();
		await expect(
			canvas.getByText('A rhyme to recall rising temperatures'),
		).toBeVisible();
		await expect(
			canvas.getByAltText('Android article thumbnail'),
		).toBeVisible();
	},
};

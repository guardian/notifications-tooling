import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { IPhoneAlertPreview } from './IPhoneAlertPreview';

const meta = {
	title: 'Stand Frontend/IPhoneAlertPreview',
	component: IPhoneAlertPreview,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'An iPhone-style app alert preview showing the alert type, headline and article thumbnail.',
			},
		},
	},
} satisfies Meta<typeof IPhoneAlertPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByLabelText('iPhone notification preview'),
		).toBeVisible();
		await expect(canvas.getByText('Apple')).toBeVisible();
		await expect(canvas.getByText('Breaking news')).toBeVisible();
		await expect(canvas.getByAltText('Article thumbnail')).toBeVisible();
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
		await expect(canvas.getByAltText('Article thumbnail')).toBeVisible();
	},
};

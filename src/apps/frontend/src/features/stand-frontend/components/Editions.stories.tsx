import type { AppAlertTopicOption } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Editions } from './Editions';

const topicTypes: AppAlertTopicOption[] = [
	{
		id: 'breaking-news',
		label: 'Breaking news',
		editions: [
			{ id: 'UK', label: 'UK' },
			{ id: 'US', label: 'US' },
			{ id: 'INT', label: 'International' },
		],
	},
];

const meta = {
	title: 'Stand Frontend/Editions',
	component: Editions,
	args: {
		topicTypes,
		selected: [],
	},
	parameters: {
		docs: {
			description: {
				component:
					'Displays app-push editions from the channel-audiences API for selected topic-type/edition payload pairs.',
			},
		},
	},
} satisfies Meta<typeof Editions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {};

export const MultipleSelections: Story = {
	args: {
		selected: [
			{ type: 'breaking-news', name: 'UK' },
			{ type: 'breaking-news', name: 'international' },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Editions')).toBeVisible();
		await expect(canvas.getByText('United Kingdom')).toBeVisible();
		await expect(canvas.getByText('International')).toBeVisible();
	},
};

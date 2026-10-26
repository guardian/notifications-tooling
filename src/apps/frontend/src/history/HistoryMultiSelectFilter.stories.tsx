import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { HistoryMultiSelectFilter } from './HistoryMultiSelectFilter';

const options = [
	{ id: 'newsletter', label: 'Newsletter' },
	{ id: 'app-push', label: 'App alert' },
] as const;

type Channel = (typeof options)[number]['id'];

const StatefulFilter = () => {
	const [selectedValues, setSelectedValues] = useState<Channel[]>([]);

	return (
		<HistoryMultiSelectFilter
			id="history-channel"
			label="Channel"
			options={options}
			selectedValues={selectedValues}
			onChange={setSelectedValues}
		/>
	);
};

const meta = {
	title: 'Dispatch/History/HistoryMultiSelectFilter',
	component: StatefulFilter,
	parameters: { layout: 'centered' },
} satisfies Meta<typeof StatefulFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectMultipleValues: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole('button', { name: 'Channel All' });

		await userEvent.click(trigger);
		await userEvent.click(
			page.getByRole('menuitemcheckbox', { name: 'Newsletter' }),
		);
		await expect(trigger).toHaveAccessibleName('Channel Newsletter');
		await expect(page.getByRole('menu', { name: 'Channel' })).toBeVisible();

		await userEvent.click(
			page.getByRole('menuitemcheckbox', { name: 'App alert' }),
		);
		await expect(trigger).toHaveAccessibleName('Channel Newsletter, App alert');
		await expect(
			page.getByRole('menuitemcheckbox', { name: 'Newsletter' }),
		).toBeChecked();
		await expect(
			page.getByRole('menuitemcheckbox', { name: 'App alert' }),
		).toBeChecked();
	},
};

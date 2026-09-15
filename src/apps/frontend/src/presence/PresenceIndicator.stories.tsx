import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { PresenceIndicator } from './PresenceIndicator';

const meta = {
	title: 'Dispatch/Presence/PresenceIndicator',
	component: PresenceIndicator,
	args: {
		presences: [],
	},
} satisfies Meta<typeof PresenceIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColleaguesViewing: Story = {
	args: {
		presences: [
			{
				clientId: {
					person: {
						firstName: 'Ada',
						lastName: 'Lovelace',
						email: 'ada.lovelace@guardian.co.uk',
					},
				},
			},
			{
				clientId: {
					person: {
						firstName: 'Grace',
						lastName: 'Hopper',
						email: 'grace.hopper@guardian.co.uk',
					},
				},
			},
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Viewing this article')).toBeInTheDocument();
		await expect(
			canvas.getByRole('listitem', { name: 'Ada Lovelace' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('listitem', { name: 'Grace Hopper' }),
		).toBeInTheDocument();
	},
};

export const DuplicateSessions: Story = {
	args: {
		presences: [
			{
				clientId: {
					person: {
						firstName: 'John',
						lastName: 'Doe',
						email: 'john.doe@guardian.co.uk',
					},
				},
			},
			{
				clientId: {
					person: {
						firstName: 'Ada',
						lastName: 'Lovelace',
						email: 'ada.lovelace@guardian.co.uk',
					},
				},
			},
			{
				clientId: {
					person: {
						firstName: 'Ada',
						lastName: 'Lovelace',
						email: 'ada.lovelace@guardian.co.uk',
					},
				},
			},
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getAllByRole('listitem', { name: 'Ada Lovelace' }),
		).toHaveLength(1);
		await expect(
			canvas.getByRole('listitem', { name: 'John Doe' }),
		).toBeInTheDocument();
	},
};

export const NobodyElseViewing: Story = {
	play: async ({ canvasElement }) => {
		await expect(
			within(canvasElement).queryByText('Viewing this article'),
		).not.toBeInTheDocument();
	},
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
	CENTRAL_PRODUCTION_CONTACT_HREF,
	DISPATCH_RUNBOOK_URL,
} from '../support-links';
import {
	DISPATCH_INFORMATION_MODAL_TITLE,
	DispatchInformationModal,
} from './DispatchInformationModal';

const meta = {
	title: 'Dispatch/Compose/DispatchInformationModal',
	component: DispatchInformationModal,
	parameters: { layout: 'centered' },
	args: {
		isOpen: true,
		onOpenChange: fn(),
	},
} satisfies Meta<typeof DispatchInformationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		const dialog = await screen.findByRole('dialog', {
			name: DISPATCH_INFORMATION_MODAL_TITLE,
		});
		await expect(dialog).toBeVisible();
		await expect(
			within(dialog).getByRole('heading', {
				name: DISPATCH_INFORMATION_MODAL_TITLE,
			}),
		).toBeVisible();

		const runbookLink = within(dialog).getByRole('link', {
			name: 'View Dispatch runbook',
		});
		await expect(runbookLink).toHaveAttribute('href', DISPATCH_RUNBOOK_URL);
		await expect(runbookLink).toHaveAttribute('target', '_blank');
		await expect(runbookLink).toHaveAttribute('rel', 'noopener noreferrer');

		await expect(
			within(dialog).getByRole('link', { name: 'Contact Central Production' }),
		).toHaveAttribute('href', CENTRAL_PRODUCTION_CONTACT_HREF);

		await userEvent.click(
			within(dialog).getByRole('button', { name: 'Close Modal' }),
		);
		await expect(args.onOpenChange).toHaveBeenCalledWith(false);
	},
};

export const Closed: Story = {
	args: { isOpen: false },
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			screen.queryByRole('dialog', {
				name: DISPATCH_INFORMATION_MODAL_TITLE,
			}),
		).not.toBeInTheDocument();
	},
};

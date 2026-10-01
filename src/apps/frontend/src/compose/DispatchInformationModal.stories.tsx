import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
	DISPATCH_FEEDBACK_FORM_URL,
	DISPATCH_USER_GUIDE_URL,
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

		const userGuideLink = within(dialog).getByRole('link', {
			name: 'View Dispatch user guide',
		});
		await expect(userGuideLink).toHaveAttribute(
			'href',
			DISPATCH_USER_GUIDE_URL,
		);
		await expect(userGuideLink).toHaveAttribute('target', '_blank');
		await expect(userGuideLink).toHaveAttribute('rel', 'noopener noreferrer');

		const feedbackLink = within(dialog).getByRole('link', {
			name: 'Report an issue or provide feedback',
		});
		await expect(feedbackLink).toHaveAttribute(
			'href',
			DISPATCH_FEEDBACK_FORM_URL,
		);
		await expect(feedbackLink).toHaveAttribute('target', '_blank');
		await expect(feedbackLink).toHaveAttribute('rel', 'noopener noreferrer');

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

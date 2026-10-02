import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CollapsibleSection } from './CollapsibleSection';

const containerStyles = css({
	width: 'min(32rem, 100%)',
	border: `1px solid ${semanticColors.border.weak}`,
});

const toggleStyles = css({
	display: 'flex',
	width: '100%',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: semanticSpacing.stackSm,
	border: 0,
	color: semanticColors.text.strong,
	backgroundColor: semanticColors.bg.raisedLevel1,
	cursor: 'pointer',
});

const contentStyles = (isExpanded: boolean) =>
	css({
		display: isExpanded ? 'block' : 'none',
		padding: semanticSpacing.stackSm,
		borderTop: `1px solid ${semanticColors.border.weak}`,
	});

const meta = {
	title: 'Dispatch/UI/CollapsibleSection',
	component: CollapsibleSection,
	parameters: { layout: 'centered' },
	args: {
		label: 'Section details',
		children: 'Content inside the collapsible section.',
		containerStyles,
		toggleStyles,
		contentStyles,
	},
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Section details' });

		await expect(toggle).toHaveAttribute('aria-controls');
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(
			canvas.queryByText('Content inside the collapsible section.'),
		).not.toBeInTheDocument();
	},
};

export const Expanded: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Section details' });

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		const contentId = toggle.getAttribute('aria-controls');
		if (!contentId) {
			throw new globalThis.Error('Collapsible content ID not found');
		}
		await expect(
			canvasElement.ownerDocument.getElementById(contentId),
		).toBeVisible();
	},
};

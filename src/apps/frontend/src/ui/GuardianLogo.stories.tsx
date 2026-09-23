import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { GuardianLogo } from './GuardianLogo';

const meta = {
	title: 'Dispatch/UI/GuardianLogo',
	component: GuardianLogo,
	parameters: { layout: 'centered' },
	args: {
		size: 88,
		borderRadius: 16,
		boxShadow: '0 2px 8px rgb(0 0 0 / 20%)',
	},
} satisfies Meta<typeof GuardianLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const logo = canvasElement.querySelector('svg');
		await expect(logo).toBeInTheDocument();
		await expect(logo).toHaveAttribute('aria-hidden', 'true');
	},
};

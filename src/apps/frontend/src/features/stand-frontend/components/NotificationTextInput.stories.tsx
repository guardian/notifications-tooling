import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationTextInput } from './NotificationTextInput';

const meta = {
	title: 'Stand Frontend/NotificationTextInput',
	component: NotificationTextInput,
	args: {
		label: 'Subject',
		description: 'Choose the subject line for the email newsletter',
		value: 'this is my subject text',
		update: () => {},
		softLimit: 46,
		hardLimit: 100,
	},
} satisfies Meta<typeof NotificationTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};

export const Disabled: Story = {
	args: { isDisabled: true },
};

export const PastSoftLimit: Story = {
	args: {
		value: 'All work and no play makes Jack a dull boy. '.repeat(2),
	},
};
export const PastHardLimit: Story = {
	args: {
		value: 'All work and no play makes Jack a dull boy. '.repeat(6),
	},
};

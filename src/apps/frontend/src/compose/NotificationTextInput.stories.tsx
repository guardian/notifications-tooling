import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
	NotificationTextInput,
	NotificationTextInputWithPrefix,
} from './NotificationTextInput';

const meta = {
	title: 'Dispatch/Compose/NotificationTextInput',
	component: NotificationTextInput,
	args: {
		name: 'subjectText',
		label: 'Subject',
		description: 'Choose the subject line for the email newsletter',
		value: 'this is my subject text',
		onChange: () => {},
		recommendedLimit: 46,
	},
} satisfies Meta<typeof NotificationTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;
type PrefixedStory = StoryObj<typeof NotificationTextInputWithPrefix>;

export const Default: Story = {
	args: {},
};

export const Disabled: Story = {
	args: { isDisabled: true },
};

export const JustBelowRecommended: Story = {
	args: {
		value: 'a'.repeat(45),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('Recommended')).toBeVisible();
		await expect(canvas.queryByText('Warning')).not.toBeInTheDocument();
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('45/46');
	},
};

export const AtRecommended: Story = {
	args: {
		value: 'a'.repeat(46),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('Warning')).toBeVisible();
		await expect(canvas.queryByText('Recommended')).not.toBeInTheDocument();
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('46/46');
	},
};

export const PastRecommended: Story = {
	args: {
		value: 'All work and no play makes Jack a dull boy. '.repeat(2),
	},
};

export const WellPastRecommended: Story = {
	args: {
		value: 'All work and no play makes Jack a dull boy. '.repeat(6),
	},
};

const renderWithPrefix: PrefixedStory['render'] = (args) => (
	<NotificationTextInputWithPrefix {...meta.args} {...args} />
);

export const WithPrefixBreakingNews: PrefixedStory = {
	args: {
		value: 'This is Guardian breaking news',
		prefix: 'Breaking news: ',
	},
	render: renderWithPrefix,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('Breaking news:')).toBeVisible();
		await expect(canvas.getByLabelText('Subject')).toHaveValue(
			'This is Guardian breaking news',
		);
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('45/46');
		await expect(canvas.getByText('Recommended')).toBeVisible();
		await expect(canvas.queryByText('Warning')).not.toBeInTheDocument();
	},
};

export const WithPrefixAtRecommended: PrefixedStory = {
	args: {
		value: 'This is Guardian breaking news!',
		prefix: 'Breaking news: ',
	},
	render: renderWithPrefix,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('Warning')).toBeVisible();
		await expect(canvas.queryByText('Recommended')).not.toBeInTheDocument();
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('46/46');
	},
};

export const WithPrefixExclusive: PrefixedStory = {
	args: {
		value: 'This is Guardian exclusive',
		prefix: 'Exclusive: ',
	},
	render: renderWithPrefix,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('Exclusive:')).toBeVisible();
		await expect(canvas.getByLabelText('Subject')).toHaveValue(
			'This is Guardian exclusive',
		);
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('37/46');
	},
};

export const WithPrefixAndEmptyValue: PrefixedStory = {
	args: {
		placeholder: 'Enter a subject line here...',
		value: '',
		prefix: 'Breaking news: ',
	},
	render: renderWithPrefix,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.queryByText('Breaking news:')).not.toBeInTheDocument();
		await expect(canvas.getByLabelText('Subject')).toHaveValue('');
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('0/46');
	},
};

export const WithPrefixAndLengthySubject: PrefixedStory = {
	args: {
		value: 'All work and no play makes Jack a dull boy. '.repeat(3),
		prefix: 'Breaking news: ',
	},
	render: renderWithPrefix,
};

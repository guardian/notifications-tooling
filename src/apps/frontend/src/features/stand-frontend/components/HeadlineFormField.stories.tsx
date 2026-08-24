import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFormContext } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import type { AppAlertFormValues } from '../notification-forms';
import { defaultAppAlertState } from '../notification-reducer';
import { HeadlineFormField } from './HeadlineFormField';

const TestForm = () => {
	const { handleSubmit } = useFormContext<AppAlertFormValues>();

	return (
		<form
			aria-label="Headline test form"
			onSubmit={(event) => void handleSubmit(() => {})(event)}
		>
			<HeadlineFormField />
			<button type="submit">Validate</button>
		</form>
	);
};

const meta = {
	title: 'Stand Frontend/Form Fields/HeadlineFormField',
	component: HeadlineFormField,
	render: () =>
		WithNotificationContext(<TestForm />, defaultAppAlertState, {}, 'push'),
} satisfies Meta<typeof HeadlineFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UpdatesHeadline: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const headline = canvas.getByLabelText('Headline');

		await userEvent.type(headline, 'A developing story');

		await expect(headline).toHaveValue('A developing story');
		await expect(
			canvas.getByLabelText('Headline character count'),
		).toHaveTextContent('18/90');
	},
};

export const ShowsValidationError: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await userEvent.click(canvas.getByRole('button', { name: 'Validate' }));

		await expect(canvas.getByText('Headline is required')).toBeVisible();
	},
};

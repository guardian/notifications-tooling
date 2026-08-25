import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFormContext } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import type { AppAlertFormValues } from '../notification-forms';
import { defaultAppAlertState } from '../notification-reducer';
import { EditionsFormField } from './EditionsFormField';

const TestForm = () => {
	const { handleSubmit } = useFormContext<AppAlertFormValues>();

	return (
		<form
			aria-label="Editions test form"
			onSubmit={(event) => void handleSubmit(() => {})(event)}
		>
			<EditionsFormField />
			<button type="submit">Validate</button>
		</form>
	);
};

const meta = {
	title: 'Stand Frontend/Form Fields/EditionsFormField',
	component: EditionsFormField,
	render: () =>
		WithNotificationContext(<TestForm />, defaultAppAlertState, {}, 'push'),
} satisfies Meta<typeof EditionsFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UpdatesSelection: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const unitedKingdom = canvas.getByRole('checkbox', {
			name: 'Select United Kingdom',
		});

		await userEvent.click(unitedKingdom);

		await expect(unitedKingdom).toBeChecked();
	},
};

export const ShowsValidationError: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await userEvent.click(canvas.getByRole('button', { name: 'Validate' }));

		await expect(canvas.getByText('Please select an edition')).toBeVisible();
	},
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFormContext } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import type { NewsletterFormValues } from '../notification-forms';
import { AudienceSegmentsFormField } from './AudienceSegmentsFormField';

const TestForm = () => {
	const { handleSubmit } = useFormContext<NewsletterFormValues>();

	return (
		<form
			aria-label="Audience segments test form"
			onSubmit={(event) => void handleSubmit(() => {})(event)}
		>
			<AudienceSegmentsFormField />
			<button type="submit">Validate</button>
		</form>
	);
};

const meta = {
	title: 'Stand Frontend/Form Fields/AudienceSegmentsFormField',
	component: AudienceSegmentsFormField,
	render: () => WithNotificationContext(<TestForm />),
} satisfies Meta<typeof AudienceSegmentsFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UpdatesSelection: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const unitedKingdom = canvas.getByRole('checkbox', {
			name: 'Select United Kingdom audience segment',
		});

		await userEvent.click(unitedKingdom);

		await expect(unitedKingdom).toBeChecked();
	},
};

export const ShowsValidationError: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await userEvent.click(canvas.getByRole('button', { name: 'Validate' }));

		await expect(
			canvas.getByText('Please select an audience segment'),
		).toBeVisible();
	},
};

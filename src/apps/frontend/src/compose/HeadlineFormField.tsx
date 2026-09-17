import { Controller, useFormContext } from 'react-hook-form';
import { APP_ALERT_LIMIT_FALLBACKS } from '../hooks/useChannelConstraints';
import type { ChannelConstraintsResponse } from '../schemas';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { NotificationTextInput } from './NotificationTextInput';

interface HeadlineFormFieldProps {
	constraints?: ChannelConstraintsResponse;
}

export const HeadlineFormField = ({ constraints }: HeadlineFormFieldProps) => {
	const { control } = useFormContext<AppAlertFormValues>();

	const appAlertConstraints = constraints?.channels['app-push'];
	const headlineLimits =
		appAlertConstraints?.content.body ?? APP_ALERT_LIMIT_FALLBACKS.headline;
	return (
		<Controller
			control={control}
			name="headline"
			render={({ field, fieldState }) => (
				<NotificationTextInput
					name={field.name}
					label="Headline"
					description="Choose the headline for the app alert"
					placeholder="Enter a headline here..."
					value={field.value}
					onChange={field.onChange}
					recommendedLimit={headlineLimits.recommended}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};

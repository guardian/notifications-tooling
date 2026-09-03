import { Controller, useFormContext } from 'react-hook-form';
import type { ChannelConstraintsResponse } from '../schemas';
import type { AppAlertFormValues } from './notification-forms';
import { NotificationTextInput } from './NotificationTextInput';
import { APP_ALERT_LIMIT_FALLBACKS } from './useChannelConstraints';

interface HeadlineFormFieldProps {
	constraints?: ChannelConstraintsResponse;
}

export const HeadlineFormField = ({ constraints }: HeadlineFormFieldProps) => {
	const { control } = useFormContext<AppAlertFormValues>();

	const appPush = constraints?.channels['app-push'];
	const headlineLimits =
		appPush?.content.body ?? APP_ALERT_LIMIT_FALLBACKS.headline;
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
					update={field.onChange}
					softLimit={headlineLimits.recommended}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};

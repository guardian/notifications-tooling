import { Controller, useFormContext } from 'react-hook-form';
import type { ChannelConstraintsResponse } from '../api/schemas';
import { APP_ALERT_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationTextInput } from './NotificationTextInput';

interface HeadlineFormFieldProps {
	constraints?: ChannelConstraintsResponse;
}

export const HeadlineFormField = ({ constraints }: HeadlineFormFieldProps) => {
	const { control } = useFormContext<AppAlertFormValues>();

	const appPush = constraints?.channels['app-push'];
	const headlineLimits =
		appPush?.compose.headline ?? APP_ALERT_LIMIT_FALLBACKS.headline;
	return (
		<Controller
			control={control}
			name="headline"
			render={({ field, fieldState }) => (
				<NotificationTextInput
					label="Headline"
					description="Choose the headline for the app alert"
					placeholder="Enter a headline here..."
					value={field.value}
					update={field.onChange}
					softLimit={headlineLimits.recommended}
					hardLimit={headlineLimits.editorialLimit}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};

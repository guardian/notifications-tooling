import { useContext } from 'react';
import type { ChannelConstraintsResponse } from '../api/schemas';
import { APP_ALERT_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import { NotificationFormContext } from '../NotificationContext';
import { NotificationTextInput } from './NotificationTextInput';

interface AppAlertFieldsProps {
	constraints?: ChannelConstraintsResponse;
}

export const AppAlertFields = ({ constraints }: AppAlertFieldsProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	if (notification.parameters?.type !== 'push') {
		return null;
	}

	const appPush = constraints?.channels['app-push'];
	const headlineLimits =
		appPush?.compose.headline ?? APP_ALERT_LIMIT_FALLBACKS.headline;

	const { headline = '' } = notification.parameters;
	// const requiredFieldErrors = validateNotificationForm(notification);
	const requiredFieldErrors: string[] = [];
	const shouldShowErrors = notification.hasAttemptedSend;

	return (
		<NotificationTextInput
			label="Headline"
			description="Choose the headline for the app alert"
			placeholder="Enter a headline here..."
			value={headline}
			update={(headline) =>
				updateNotification({
					type: 'modify-app-alert-parameters',
					appMod: { headline },
				})
			}
			softLimit={headlineLimits.recommended}
			hardLimit={headlineLimits.editorialLimit}
			error={
				shouldShowErrors && requiredFieldErrors.includes('headline')
					? 'Headline is required'
					: undefined
			}
		/>
	);
};

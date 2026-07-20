import { semanticSpacing } from '@guardian/stand';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';
import { EmailFields } from './EmailFields';

/**
 * This is a non-functional placeholder to demonstrate how content will appear in the layout
 */
export const CreateNotificationForm = () => {
	const { notification, updateNotification } = useContext(NotificationContext);

	return (
		<>
			<Typography variant="titleMd" element="h2">
				Create a Notification
			</Typography>

			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
				}}
			>
				<TextInput
					label="Article"
					value={notification.articleId ?? ''}
					description="Copy and paste a Guardian URL below"
					onChange={(text) =>
						updateNotification({ type: 'set-article-id', text })
					}
				/>
				<div>
					<Typography>{notification.articleId ?? ''}</Typography>
				</div>

				<EmailFields />
			</div>
		</>
	);
};

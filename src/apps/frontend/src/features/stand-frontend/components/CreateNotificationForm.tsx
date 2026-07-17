import { semanticSpacing } from '@guardian/stand';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';

const toOptionKey = (value: string, name = 'kicker') => `${name}//${value}`;

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

				{notification.parameters?.type === 'email' && (
					<>
						<Select
							name="kicker"
							label="Kicker"
							description="Choose the kicker for the email newsletter"
							onChange={(key) => {
								const kicker =
									typeof key === 'string' ? key.split('//').at(1) : undefined;
								switch (kicker) {
									case 'breaking-news':
										return updateNotification({
											type: 'modify-email-parameters',
											mod: { kicker },
										});
									case 'exclusive':
										return updateNotification({
											type: 'modify-email-parameters',
											mod: { kicker },
										});
									default:
										return updateNotification({
											type: 'modify-email-parameters',
											mod: { kicker: undefined },
										});
								}
							}}
							selectionMode="single"
							value={toOptionKey(notification.parameters.kicker ?? 'undefined')}
						>
							<Option id={toOptionKey('breaking-news')}>Breaking News</Option>
							<Option id={toOptionKey('exclusive')}>Exclusive</Option>
							<Option id={toOptionKey('undefined')}>None</Option>
						</Select>

						<TextInput
							label="Subject"
							description="The kicker counts towards the character limit of the subject"
							value={notification.parameters.subject ?? ''}
							onChange={(subject) =>
								updateNotification({
									type: 'modify-email-parameters',
									mod: { subject },
								})
							}
						/>

						<TextInput
							label="Preview text"
							description="Choose the preview text for the email newsletter"
							value={notification.parameters.preview ?? ''}
							onChange={(preview) =>
								updateNotification({
									type: 'modify-email-parameters',
									mod: { preview },
								})
							}
						/>
					</>
				)}
			</div>
		</>
	);
};

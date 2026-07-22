import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelOptions } from './ChannelOptions';
import { EmailFields } from './EmailFields';
import { SendButton } from './SendButton';

export const CreateNotificationForm = () => {

	return (
		<>
			<Typography variant="heading2Xl" element="h2">
				Create a Notification
			</Typography>

			<div
				css={{
					marginTop: semanticSpacing.stackXl,
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
				}}
			>
				<ArticleImportControl />
				<ChannelOptions />
				<EmailFields />
				<SendButton />
			</div>
		</>
	);
};

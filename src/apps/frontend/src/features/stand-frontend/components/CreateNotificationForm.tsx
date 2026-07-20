import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { ArticleImportControl } from './ArticleImportControl';
import { EmailFields } from './EmailFields';

export const CreateNotificationForm = () => {
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
				<ArticleImportControl />

				<EmailFields />
			</div>
		</>
	);
};

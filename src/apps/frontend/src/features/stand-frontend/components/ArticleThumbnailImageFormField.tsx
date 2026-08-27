import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { ToggleSwitch } from './ToggleSwitch';

export const ArticleThumbnailImageFormField = () => {
	const {
		notification: { content },
	} = useContext(NotificationFormContext);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="labelFormMd">Article thumbnail image</Typography>
			<ToggleSwitch content={content ?? {}} />
		</div>
	);
};

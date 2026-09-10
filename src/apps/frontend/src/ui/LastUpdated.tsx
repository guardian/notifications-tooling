import { semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useRelativeTime } from '../hooks/use-relative-time';

interface LastUpdatedProps {
	updatedAt: string;
}

export const LastUpdated = ({ updatedAt }: LastUpdatedProps) => {
	const relativeTime = useRelativeTime(updatedAt, 'long-minutes');

	if (!relativeTime) {
		return null;
	}

	return (
		<Typography variant="bodySm" theme={{ color: semanticColors.text.weak }}>
			Last updated:{' '}
			<time
				dateTime={relativeTime.iso8601}
				title={relativeTime.formattedAbsoluteTime}
			>
				{relativeTime.label}
			</time>
		</Typography>
	);
};

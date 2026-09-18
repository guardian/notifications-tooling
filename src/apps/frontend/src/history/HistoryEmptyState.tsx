import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { historyViewStyles } from '../themes';

interface HistoryEmptyStateProps {
	isFilteredResult?: boolean;
}

export const HistoryEmptyState = ({
	isFilteredResult = false,
}: HistoryEmptyStateProps) => (
	<div css={historyViewStyles.empty}>
		<div css={historyViewStyles.emptyIcon} aria-hidden="true">
			<Icon symbol="notifications" size="lg" />
		</div>
		<Typography element="h2" variant="headingSm">
			{isFilteredResult
				? 'No notifications match these filters'
				: 'No alerts yet'}
		</Typography>
		{!isFilteredResult && (
			<Typography variant="bodyMd" cssOverrides={historyViewStyles.emptyCopy}>
				Alerts will appear here after they have been sent.
			</Typography>
		)}
	</div>
);

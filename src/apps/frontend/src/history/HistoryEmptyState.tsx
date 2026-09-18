import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { historyViewStyles } from '../themes';

interface HistoryEmptyStateProps {
	isSearchResult?: boolean;
}

export const HistoryEmptyState = ({
	isSearchResult = false,
}: HistoryEmptyStateProps) => (
	<div css={historyViewStyles.empty}>
		<div css={historyViewStyles.emptyIcon} aria-hidden="true">
			<Icon symbol="notifications" size="lg" />
		</div>
		<Typography element="h2" variant="headingSm">
			{isSearchResult ? 'No matching alerts' : 'No alerts yet'}
		</Typography>
		<Typography variant="bodyMd" cssOverrides={historyViewStyles.emptyCopy}>
			{isSearchResult
				? 'Try a different search term.'
				: 'Alerts will appear here after they have been sent.'}
		</Typography>
	</div>
);

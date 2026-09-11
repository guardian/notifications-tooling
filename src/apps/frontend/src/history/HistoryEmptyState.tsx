import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { historyViewStyles } from '../themes';

export const HistoryEmptyState = () => (
	<div css={historyViewStyles.empty}>
		<div css={historyViewStyles.emptyIcon} aria-hidden="true">
			<Icon symbol="notifications" size="lg" />
		</div>
		<Typography element="h2" variant="headingSm">
			No alerts yet
		</Typography>
		<Typography variant="bodyMd" cssOverrides={historyViewStyles.emptyCopy}>
			Alerts will appear here after they have been sent.
		</Typography>
	</div>
);

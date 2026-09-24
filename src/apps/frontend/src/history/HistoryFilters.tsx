import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { historyViewStyles } from '../themes';
import { ClearHistoryFiltersButton } from './ClearHistoryFiltersButton';
import { HistoryAlertTypeFilter } from './HistoryAlertTypeFilter';
import { HistoryAudienceFilter } from './HistoryAudienceFilter';
import { HistorySearchFilter } from './HistorySearchFilter';
import { HistorySenderFilter } from './HistorySenderFilter';
import { HistoryStatusFilter } from './HistoryStatusFilter';

const filtersId = 'history-filters';

export const HistoryFilters = () => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div css={historyViewStyles.filtersPanel(isExpanded)}>
			<button
				type="button"
				aria-controls={filtersId}
				aria-expanded={isExpanded}
				onClick={() => setIsExpanded((expanded) => !expanded)}
				css={historyViewStyles.filtersToggle(isExpanded)}
			>
				<Typography variant="bodyBoldMd">
					Search and filter the history
				</Typography>
				<Icon
					symbol={isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
				/>
			</button>
			<aside
				id={filtersId}
				aria-label="Filters"
				css={historyViewStyles.filters(isExpanded)}
			>
				<ClearHistoryFiltersButton />
				<div css={historyViewStyles.filterFields}>
					<HistorySearchFilter />
					<HistoryAlertTypeFilter />
					<HistorySenderFilter />
					<HistoryAudienceFilter />
					<HistoryStatusFilter />
				</div>
			</aside>
		</div>
	);
};

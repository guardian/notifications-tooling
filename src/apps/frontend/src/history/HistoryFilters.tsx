import { historyViewStyles } from '../themes';
import { ClearHistoryFiltersButton } from './ClearHistoryFiltersButton';
import { HistoryAlertTypeFilter } from './HistoryAlertTypeFilter';
import { HistoryAudienceFilter } from './HistoryAudienceFilter';
import { HistorySearchFilter } from './HistorySearchFilter';
import { HistorySenderFilter } from './HistorySenderFilter';
import { HistoryStatusFilter } from './HistoryStatusFilter';

export const HistoryFilters = () => (
	<aside aria-label="Filters" css={historyViewStyles.filters}>
		<ClearHistoryFiltersButton />
		<div css={historyViewStyles.filterFields}>
			<HistorySearchFilter />
			<HistoryAlertTypeFilter />
			<HistorySenderFilter />
			<HistoryAudienceFilter />
			<HistoryStatusFilter />
		</div>
	</aside>
);

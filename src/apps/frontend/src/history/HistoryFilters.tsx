import { historyViewStyles } from '../themes';
import { ClearHistoryFiltersButton } from './ClearHistoryFiltersButton';
import { HistoryAlertTypeFilter } from './HistoryAlertTypeFilter';
import { HistoryAudienceFilter } from './HistoryAudienceFilter';
import { HistorySearchFilter } from './HistorySearchFilter';
import { HistoryStatusFilter } from './HistoryStatusFilter';

export const HistoryFilters = () => (
	<aside aria-label="Filters" css={historyViewStyles.filters}>
		<ClearHistoryFiltersButton />
		<div css={historyViewStyles.filterFields}>
			<HistorySearchFilter />
			<HistoryAudienceFilter />
			<HistoryStatusFilter />
			<HistoryAlertTypeFilter />
		</div>
	</aside>
);

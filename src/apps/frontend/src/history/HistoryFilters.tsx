import { historyViewStyles } from '../themes';
import { ClearHistoryFiltersButton } from './ClearHistoryFiltersButton';
import { HistoryAudienceFilter } from './HistoryAudienceFilter';
import { HistorySearchFilter } from './HistorySearchFilter';

export const HistoryFilters = () => (
	<aside aria-label="Filters" css={historyViewStyles.filters}>
		<ClearHistoryFiltersButton />
		<div css={historyViewStyles.filterFields}>
			<HistorySearchFilter />
			<HistoryAudienceFilter />
		</div>
	</aside>
);

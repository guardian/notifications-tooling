import { historyViewStyles } from '../themes';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { ClearHistoryFiltersButton } from './ClearHistoryFiltersButton';
import { HistoryAlertTypeFilter } from './HistoryAlertTypeFilter';
import { HistoryAudienceFilter } from './HistoryAudienceFilter';
import { HistoryChannelFilter } from './HistoryChannelFilter';
import { HistorySearchFilter } from './HistorySearchFilter';
import { HistorySenderFilter } from './HistorySenderFilter';
import { HistoryStatusFilter } from './HistoryStatusFilter';

const filtersId = 'history-filters';

export const HistoryFilters = () => {
	return (
		<CollapsibleSection
			label="Search and filter the history"
			contentId={filtersId}
			contentAs="aside"
			contentAriaLabel="Filters"
			keepMounted
			containerStyles={historyViewStyles.filtersPanel}
			toggleStyles={historyViewStyles.filtersToggle}
			contentStyles={historyViewStyles.filters}
		>
			<ClearHistoryFiltersButton />
			<div css={historyViewStyles.filterFields}>
				<HistorySearchFilter />
				<HistoryChannelFilter />
				<HistoryAlertTypeFilter />
				<HistorySenderFilter />
				<HistoryAudienceFilter />
				<HistoryStatusFilter />
			</div>
		</CollapsibleSection>
	);
};

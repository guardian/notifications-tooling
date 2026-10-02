import { useSearchParams } from 'react-router-dom';
import {
	type HistoryStatusCategory,
	parseHistorySearchParams,
	updateHistoryMultiSelectFilter,
} from '../utils/history-search-params';
import { HistoryMultiSelectFilter } from './HistoryMultiSelectFilter';

const STATUS_OPTIONS = [
	{ id: 'sent', label: 'Sent' },
	{ id: 'error', label: 'Error' },
] satisfies Array<{ id: HistoryStatusCategory; label: string }>;

export const HistoryStatusFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { statuses: selectedStatuses = [] } =
		parseHistorySearchParams(searchParams);
	const handleStatusChange = (statuses: HistoryStatusCategory[]) => {
		setSearchParams(
			(currentSearchParams) =>
				updateHistoryMultiSelectFilter(currentSearchParams, 'status', statuses),
			{ replace: true },
		);
	};

	return (
		<HistoryMultiSelectFilter
			id="history-status"
			label="Status"
			options={STATUS_OPTIONS}
			selectedValues={selectedStatuses}
			onChange={handleStatusChange}
		/>
	);
};

import { EmptyState } from '../ui/EmptyState';

interface HistoryEmptyStateProps {
	isFilteredResult?: boolean;
}

export const HistoryEmptyState = ({
	isFilteredResult = false,
}: HistoryEmptyStateProps) => (
	<EmptyState
		title={
			isFilteredResult
				? 'No notifications match these filters'
				: 'No alerts yet'
		}
		description={
			isFilteredResult
				? undefined
				: 'Alerts will appear here after they have been sent.'
		}
	/>
);

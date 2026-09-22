import { EmptyState } from '../ui/EmptyState';

interface HistoryEmptyStateProps {
	isSearchResult?: boolean;
}

export const HistoryEmptyState = ({
	isSearchResult = false,
}: HistoryEmptyStateProps) => (
	<EmptyState
		title={isSearchResult ? 'No matching alerts' : 'No alerts yet'}
		description={
			isSearchResult
				? 'Try a different search term.'
				: 'Alerts will appear here after they have been sent.'
		}
	/>
);

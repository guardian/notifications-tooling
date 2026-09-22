import { Button } from '@guardian/stand/Button';
import { useSearchParams } from 'react-router-dom';
import { historyViewStyles } from '../themes';
import { parseHistorySearchParams } from '../utils/history-search-params';

export const ClearHistoryFiltersButton = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { search, audiences, statuses } =
		parseHistorySearchParams(searchParams);
	const hasActiveFilters =
		search !== undefined ||
		(audiences?.length ?? 0) > 0 ||
		(statuses?.length ?? 0) > 0;

	return (
		<Button
			type="button"
			variant="tertiary"
			size="sm"
			cssOverrides={
				hasActiveFilters
					? historyViewStyles.clearFilters
					: [
							historyViewStyles.clearFilters,
							historyViewStyles.clearFiltersHidden,
						]
			}
			isDisabled={!hasActiveFilters}
			aria-hidden={!hasActiveFilters}
			onPress={() => setSearchParams(new URLSearchParams(), { replace: true })}
		>
			Clear all
		</Button>
	);
};

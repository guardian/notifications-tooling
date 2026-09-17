import { TextInput } from '@guardian/stand/TextInput';
import { historyViewStyles } from '../themes';
import { MAXIMUM_SEARCH_LENGTH } from '../utils/history-search-params';

interface HistoryFiltersProps {
	searchTerm: string;
	onSearchTermChange: (searchTerm: string) => void;
}

export const HistoryFilters = ({
	searchTerm,
	onSearchTermChange,
}: HistoryFiltersProps) => (
	<aside aria-label="Filters" css={historyViewStyles.filters}>
		<TextInput
			label="Search"
			type="search"
			placeholder="Search"
			value={searchTerm}
			onChange={onSearchTermChange}
			maxLength={MAXIMUM_SEARCH_LENGTH}
			fluid
		/>
	</aside>
);

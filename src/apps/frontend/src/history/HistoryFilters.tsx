import { TextInput } from '@guardian/stand/TextInput';
import { historyViewStyles } from '../themes';

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
			fluid
		/>
	</aside>
);

import { Icon } from '@guardian/stand/Icon';
import { TextInput } from '@guardian/stand/TextInput';
import { useSearchParams } from 'react-router-dom';
import { historyViewStyles } from '../themes';
import {
	MAXIMUM_SEARCH_LENGTH,
	parseHistorySearchParams,
} from '../utils/history-search-params';

export const HistorySearchFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { limit, search } = parseHistorySearchParams(searchParams);

	const handleSearchTermChange = (nextSearchTerm: string) => {
		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);
				if (nextSearchTerm.trim()) {
					nextSearchParams.set('search', nextSearchTerm);
				} else {
					nextSearchParams.delete('search');
				}
				nextSearchParams.set('offset', '0');
				nextSearchParams.set('limit', String(limit));

				return nextSearchParams;
			},
			{ replace: true },
		);
	};

	return (
		<div css={historyViewStyles.searchField}>
			<TextInput
				label="Search"
				type="search"
				placeholder="Search"
				value={search ?? ''}
				onChange={handleSearchTermChange}
				maxLength={MAXIMUM_SEARCH_LENGTH}
				theme={{ shared: { padding: { left: '44px' } } }}
				fluid
			/>
			<Icon
				symbol="search"
				size="md"
				cssOverrides={historyViewStyles.searchIcon}
			/>
		</div>
	);
};

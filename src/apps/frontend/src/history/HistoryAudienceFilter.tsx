import { appAlertTopicEditionId, toDisplayEditionId } from '@models';
import { useSearchParams } from 'react-router-dom';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { getAudienceEditionLabel } from '../utils/audience-edition-label';
import {
	HISTORY_AUDIENCE_IDS,
	parseHistorySearchParams,
	updateHistoryMultiSelectFilter,
} from '../utils/history-search-params';
import { HistoryMultiSelectFilter } from './HistoryMultiSelectFilter';

export const HistoryAudienceFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const channelAudiences = useChannelAudiences();
	const { audiences: selectedAudiences = [] } =
		parseHistorySearchParams(searchParams);
	const audienceOptions = HISTORY_AUDIENCE_IDS.map((id) => ({
		id,
		label: getAudienceEditionLabel({
			audiences: channelAudiences.data,
			edition: toDisplayEditionId(appAlertTopicEditionId.parse(id)),
		}),
	}));
	const handleAudienceChange = (audiences: string[]) => {
		setSearchParams(
			(currentSearchParams) =>
				updateHistoryMultiSelectFilter(
					currentSearchParams,
					'audience',
					audiences,
				),
			{ replace: true },
		);
	};

	return (
		<HistoryMultiSelectFilter
			id="history-audience"
			label="Audience / Editions"
			options={audienceOptions}
			selectedValues={selectedAudiences}
			onChange={handleAudienceChange}
		/>
	);
};

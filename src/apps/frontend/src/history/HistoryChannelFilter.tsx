import { notificationChannelOptions } from '@models';
import { useSearchParams } from 'react-router-dom';
import {
	type HistoryChannel,
	parseHistorySearchParams,
	updateHistoryMultiSelectFilter,
} from '../utils/history-search-params';
import { HistoryMultiSelectFilter } from './HistoryMultiSelectFilter';

export const HistoryChannelFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { channels: selectedChannels = [] } =
		parseHistorySearchParams(searchParams);
	const handleChannelChange = (channels: HistoryChannel[]) => {
		setSearchParams(
			(currentSearchParams) =>
				updateHistoryMultiSelectFilter(
					currentSearchParams,
					'channel',
					channels,
				),
			{ replace: true },
		);
	};

	return (
		<HistoryMultiSelectFilter
			id="history-channel"
			label="Channel"
			options={notificationChannelOptions}
			selectedValues={selectedChannels}
			onChange={handleChannelChange}
		/>
	);
};

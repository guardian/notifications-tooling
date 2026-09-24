import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { notificationChannelOptions } from '@models';
import { useSearchParams } from 'react-router-dom';
import { historyViewStyles } from '../themes';
import {
	type HistoryChannel,
	parseHistorySearchParams,
	resolveHistoryFilterSelection,
	updateHistoryMultiSelectFilter,
} from '../utils/history-search-params';

const historyChannels = notificationChannelOptions.map(({ id }) => id);

export const HistoryChannelFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { channels: selectedChannels = [] } =
		parseHistorySearchParams(searchParams);
	const selectedChannelLabel = notificationChannelOptions
		.filter(({ id }) => selectedChannels.includes(id))
		.map(({ label }) => label)
		.join(', ');

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
		<div css={historyViewStyles.audienceField}>
			<Typography
				id="history-channel-label"
				element="span"
				variant="labelFormMd"
			>
				Channel
			</Typography>
			<Menu
				aria-labelledby="history-channel-label"
				popoverProps={{ cssOverrides: historyViewStyles.audiencePopover }}
				selectionMode="multiple"
				selectedKeys={new Set(selectedChannels)}
				onSelectionChange={(selection) =>
					handleChannelChange(
						resolveHistoryFilterSelection(selection, historyChannels),
					)
				}
				shouldCloseOnSelect={false}
			>
				<MenuToggle>
					<Button
						type="button"
						variant="secondary"
						aria-labelledby="history-channel-label history-channel-value"
						cssOverrides={historyViewStyles.audienceTrigger}
					>
						<span
							id="history-channel-value"
							css={historyViewStyles.audienceTriggerValue}
						>
							{selectedChannels.length === 0 ? 'All' : selectedChannelLabel}
						</span>
						<Icon symbol="keyboard_arrow_down" size="lg" />
					</Button>
				</MenuToggle>
				{notificationChannelOptions.map(({ id, label }) => (
					<MenuItem
						key={id}
						id={id}
						aria-label={label}
						textValue={label}
						cssOverrides={historyViewStyles.audienceMenuItem}
						label={
							<span aria-hidden="true" inert css={historyViewStyles.visualOnly}>
								<Checkbox
									size="md"
									isSelected={selectedChannels.includes(id)}
									isReadOnly
									cssOverrides={historyViewStyles.filterCheckbox}
								>
									{label}
								</Checkbox>
							</span>
						}
					/>
				))}
			</Menu>
		</div>
	);
};

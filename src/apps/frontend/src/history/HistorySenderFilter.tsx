import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { useSearchParams } from 'react-router-dom';
import { useNotificationSenders } from '../hooks/useNotificationSenders';
import { historyViewStyles } from '../themes';
import {
	parseHistorySearchParams,
	resolveHistoryFilterSelection,
	updateHistoryMultiSelectFilter,
} from '../utils/history-search-params';
import { getSenderDisplayName } from '../utils/notification-history-mapper';

export const HistorySenderFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { senders: selectedSenders = [], since } =
		parseHistorySearchParams(searchParams);
	const notificationSenders = useNotificationSenders(since);
	const senderOptions = notificationSenders.data?.senders ?? [];
	const selectedSenderLabel = selectedSenders
		.map(getSenderDisplayName)
		.join(', ');

	const handleSenderChange = (senders: string[]) => {
		setSearchParams(
			(currentSearchParams) =>
				updateHistoryMultiSelectFilter(
					currentSearchParams,
					'createdByEmail',
					senders,
				),
			{ replace: true },
		);
	};

	return (
		<div css={historyViewStyles.audienceField}>
			<Typography
				id="history-sender-label"
				element="span"
				variant="labelFormMd"
			>
				Sender
			</Typography>
			<Menu
				aria-labelledby="history-sender-label"
				popoverProps={{ cssOverrides: historyViewStyles.senderPopover }}
				selectionMode="multiple"
				selectedKeys={new Set(selectedSenders)}
				onSelectionChange={(selection) =>
					handleSenderChange(
						resolveHistoryFilterSelection(selection, senderOptions),
					)
				}
				shouldCloseOnSelect={false}
			>
				<MenuToggle>
					<Button
						type="button"
						variant="secondary"
						aria-labelledby="history-sender-label history-sender-value"
						cssOverrides={historyViewStyles.audienceTrigger}
						isDisabled={
							notificationSenders.isPending || notificationSenders.isError
						}
					>
						<span
							id="history-sender-value"
							css={historyViewStyles.audienceTriggerValue}
						>
							{notificationSenders.isPending
								? 'Loading...'
								: notificationSenders.isError
									? 'Unavailable'
									: selectedSenders.length === 0
										? 'All'
										: selectedSenderLabel}
						</span>
						<Icon symbol="keyboard_arrow_down" size="lg" />
					</Button>
				</MenuToggle>
				{senderOptions.map((sender) => {
					const label = getSenderDisplayName(sender);
					return (
						<MenuItem
							key={sender}
							id={sender}
							aria-label={label}
							textValue={label}
							cssOverrides={historyViewStyles.audienceMenuItem}
							label={
								<span
									aria-hidden="true"
									inert
									css={historyViewStyles.visualOnly}
								>
									<Checkbox
										size="md"
										isSelected={selectedSenders.includes(sender)}
										isReadOnly
										cssOverrides={historyViewStyles.senderCheckbox}
									>
										<span css={historyViewStyles.senderOptionValue}>
											{label}
										</span>
									</Checkbox>
								</span>
							}
						/>
					);
				})}
			</Menu>
		</div>
	);
};

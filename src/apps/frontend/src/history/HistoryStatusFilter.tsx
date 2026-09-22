import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { useSearchParams } from 'react-router-dom';
import { historyViewStyles } from '../themes';
import {
	HISTORY_STATUS_CATEGORIES,
	type HistoryStatusCategory,
	parseHistorySearchParams,
} from '../utils/history-search-params';

const STATUS_OPTIONS = [
	{ id: 'sent', label: 'Sent' },
	{ id: 'error', label: 'Error' },
] satisfies Array<{ id: HistoryStatusCategory; label: string }>;

export const HistoryStatusFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { limit, statuses: selectedStatuses = [] } =
		parseHistorySearchParams(searchParams);
	const selectedStatusLabel = STATUS_OPTIONS.filter(({ id }) =>
		selectedStatuses.includes(id),
	)
		.map(({ label }) => label)
		.join(', ');

	const handleStatusChange = (statuses: HistoryStatusCategory[]) => {
		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);
				nextSearchParams.delete('status');
				for (const status of statuses) {
					nextSearchParams.append('status', status);
				}
				nextSearchParams.set('offset', '0');
				nextSearchParams.set('limit', String(limit));

				return nextSearchParams;
			},
			{ replace: true },
		);
	};

	return (
		<div css={historyViewStyles.audienceField}>
			<Typography
				id="history-status-label"
				element="span"
				variant="labelFormMd"
			>
				Status
			</Typography>
			<Menu
				aria-labelledby="history-status-label"
				popoverProps={{ cssOverrides: historyViewStyles.audiencePopover }}
				selectionMode="multiple"
				selectedKeys={new Set(selectedStatuses)}
				onSelectionChange={(selection) => {
					const keys =
						selection === 'all'
							? [...HISTORY_STATUS_CATEGORIES]
							: [...selection].flatMap((key) =>
									HISTORY_STATUS_CATEGORIES.includes(
										key as HistoryStatusCategory,
									)
										? [key as HistoryStatusCategory]
										: [],
								);
					handleStatusChange(keys);
				}}
				shouldCloseOnSelect={false}
			>
				<MenuToggle>
					<Button
						type="button"
						variant="secondary"
						aria-labelledby="history-status-label history-status-value"
						cssOverrides={historyViewStyles.audienceTrigger}
					>
						<span
							id="history-status-value"
							css={historyViewStyles.audienceTriggerValue}
						>
							{selectedStatuses.length === 0 ? 'All' : selectedStatusLabel}
						</span>
						<Icon symbol="keyboard_arrow_down" size="lg" />
					</Button>
				</MenuToggle>
				{STATUS_OPTIONS.map(({ id, label }) => (
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
									isSelected={selectedStatuses.includes(id)}
									isReadOnly
									cssOverrides={historyViewStyles.audienceCheckbox}
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

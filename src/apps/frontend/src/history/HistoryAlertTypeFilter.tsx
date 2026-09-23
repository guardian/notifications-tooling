import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { type HistoryAlertType, historyAlertTypeSchema } from '@models';
import { useId } from 'react';
import { useSearchParams } from 'react-router-dom';
import { historyViewStyles } from '../themes';
import {
	parseHistorySearchParams,
	resolveHistoryFilterSelection,
	updateHistoryFilters,
} from '../utils/history-search-params';

const alertTypeLabels: Record<HistoryAlertType, string> = {
	none: 'None',
	'breaking-news': 'Breaking news',
	exclusive: 'Exclusive',
	'editors-picks': "Editors' picks",
	'one-not-to-miss': 'One not to miss',
	sport: 'Sports',
};

export const hasInvalidAlertTypes = (alertTypes: string[]) =>
	!historyAlertTypeSchema.array().safeParse(alertTypes).success;

export const HistoryAlertTypeFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { alertTypes = [] } = parseHistorySearchParams(searchParams);
	const isInvalid = hasInvalidAlertTypes(alertTypes);
	const labelId = useId();
	const summaryId = useId();
	const summary = isInvalid
		? 'Invalid filter'
		: historyAlertTypeSchema.options
				.filter((id) => alertTypes.includes(id))
				.map((id) => alertTypeLabels[id])
				.join(', ') || 'All';

	const handleAlertTypesChange = (nextAlertTypes: string[]) => {
		setSearchParams((currentSearchParams) =>
			updateHistoryFilters(currentSearchParams, { alertTypes: nextAlertTypes }),
		);
	};

	return (
		<div css={historyViewStyles.categoryFilter}>
			<Typography id={labelId} variant="labelFormMd">
				Kicker / Alert type
			</Typography>
			<Menu
				aria-labelledby={labelId}
				selectionMode="multiple"
				selectedKeys={alertTypes}
				onSelectionChange={(selection) =>
					handleAlertTypesChange(
						resolveHistoryFilterSelection(
							selection,
							historyAlertTypeSchema.options,
						),
					)
				}
				popoverProps={{ cssOverrides: historyViewStyles.categoryPopover }}
			>
				<MenuToggle>
					<Button
						variant="secondary"
						isDisabled={isInvalid}
						aria-labelledby={`${labelId} ${summaryId}`}
						cssOverrides={historyViewStyles.categoryButton}
					>
						<span
							id={summaryId}
							css={historyViewStyles.categorySummary}
							title={summary}
						>
							{summary}
						</span>
						<Icon symbol="keyboard_arrow_down" size="md" />
					</Button>
				</MenuToggle>
				{historyAlertTypeSchema.options.map((id) => (
					<MenuItem
						key={id}
						id={id}
						aria-label={alertTypeLabels[id]}
						textValue={alertTypeLabels[id]}
						shouldCloseOnSelect={false}
						cssOverrides={historyViewStyles.categoryMenuItem}
						label={
							<span aria-hidden="true" inert css={historyViewStyles.visualOnly}>
								<Checkbox
									size="md"
									isSelected={alertTypes.includes(id)}
									isReadOnly
									cssOverrides={historyViewStyles.filterCheckbox}
								>
									{alertTypeLabels[id]}
								</Checkbox>
							</span>
						}
					/>
				))}
			</Menu>
		</div>
	);
};

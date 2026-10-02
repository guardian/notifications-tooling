import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { historyViewStyles } from '../themes';
import { resolveHistoryFilterSelection } from '../utils/history-search-params';

type FilterOption<Value extends string> = {
	id: Value;
	label: string;
};

type HistoryMultiSelectFilterProps<Value extends string> = {
	id: string;
	label: string;
	options: ReadonlyArray<FilterOption<Value>>;
	selectedValues: readonly Value[];
	onChange: (values: Value[]) => void;
};

export const HistoryMultiSelectFilter = <Value extends string>({
	id,
	label,
	options,
	selectedValues,
	onChange,
}: HistoryMultiSelectFilterProps<Value>) => {
	const labelId = `${id}-label`;
	const valueId = `${id}-value`;
	const optionIds = options.map(({ id: optionId }) => optionId);
	const selectedLabel = options
		.filter(({ id: optionId }) => selectedValues.includes(optionId))
		.map(({ label: optionLabel }) => optionLabel)
		.join(', ');

	return (
		<div css={historyViewStyles.audienceField}>
			<Typography id={labelId} element="span" variant="labelFormMd">
				{label}
			</Typography>
			<Menu
				aria-labelledby={labelId}
				popoverProps={{ cssOverrides: historyViewStyles.audiencePopover }}
				selectionMode="multiple"
				selectedKeys={new Set(selectedValues)}
				onSelectionChange={(selection) =>
					onChange(resolveHistoryFilterSelection(selection, optionIds))
				}
				shouldCloseOnSelect={false}
			>
				<MenuToggle>
					<Button
						type="button"
						variant="secondary"
						aria-labelledby={`${labelId} ${valueId}`}
						cssOverrides={historyViewStyles.audienceTrigger}
					>
						<span id={valueId} css={historyViewStyles.audienceTriggerValue}>
							{selectedValues.length === 0 ? 'All' : selectedLabel}
						</span>
						<Icon symbol="keyboard_arrow_down" size="lg" />
					</Button>
				</MenuToggle>
				{options.map(({ id: optionId, label: optionLabel }) => (
					<MenuItem
						key={optionId}
						id={optionId}
						aria-label={optionLabel}
						textValue={optionLabel}
						cssOverrides={historyViewStyles.audienceMenuItem}
						label={
							<span aria-hidden="true" inert css={historyViewStyles.visualOnly}>
								<Checkbox
									size="md"
									isSelected={selectedValues.includes(optionId)}
									isReadOnly
									cssOverrides={historyViewStyles.filterCheckbox}
								>
									{optionLabel}
								</Checkbox>
							</span>
						}
					/>
				))}
			</Menu>
		</div>
	);
};

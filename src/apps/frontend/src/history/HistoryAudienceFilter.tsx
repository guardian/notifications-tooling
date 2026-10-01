import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { appAlertTopicEditionId, toDisplayEditionId } from '@models';
import { useSearchParams } from 'react-router-dom';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { historyViewStyles } from '../themes';
import { getAudienceEditionLabel } from '../utils/audience-edition-label';
import {
	HISTORY_AUDIENCE_IDS,
	parseHistorySearchParams,
	resolveHistoryFilterSelection,
	updateHistoryMultiSelectFilter,
} from '../utils/history-search-params';

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
	const selectedAudienceLabel = audienceOptions
		.filter(({ id }) => selectedAudiences.includes(id))
		.map(({ label }) => label)
		.join(', ');

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
		<div css={historyViewStyles.audienceField}>
			<Typography
				id="history-audience-label"
				element="span"
				variant="labelFormMd"
			>
				Audience / Editions
			</Typography>
			<Menu
				aria-labelledby="history-audience-label"
				popoverProps={{ cssOverrides: historyViewStyles.audiencePopover }}
				selectionMode="multiple"
				selectedKeys={new Set(selectedAudiences)}
				onSelectionChange={(selection) =>
					handleAudienceChange(
						resolveHistoryFilterSelection(selection, HISTORY_AUDIENCE_IDS),
					)
				}
				shouldCloseOnSelect={false}
			>
				<MenuToggle>
					<Button
						type="button"
						variant="secondary"
						aria-labelledby="history-audience-label history-audience-value"
						cssOverrides={historyViewStyles.audienceTrigger}
					>
						<span
							id="history-audience-value"
							css={historyViewStyles.audienceTriggerValue}
						>
							{selectedAudiences.length === 0 ? 'All' : selectedAudienceLabel}
						</span>
						<Icon symbol="keyboard_arrow_down" size="lg" />
					</Button>
				</MenuToggle>
				{audienceOptions.map(({ id, label }) => (
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
									isSelected={selectedAudiences.includes(id)}
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

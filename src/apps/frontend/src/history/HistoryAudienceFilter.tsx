import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { Typography } from '@guardian/stand/Typography';
import { notificationAudienceFilterId } from '@models';
import { useSearchParams } from 'react-router-dom';
import { historyViewStyles } from '../themes';
import {
	HISTORY_AUDIENCE_IDS,
	parseHistorySearchParams,
} from '../utils/history-search-params';

const audienceLabels: Record<string, string> = {
	uk: 'United Kingdom',
	us: 'United States',
	au: 'Australia',
	europe: 'Europe',
	international: 'International',
};

const audienceOptions = HISTORY_AUDIENCE_IDS.map((id) => ({
	id,
	label: audienceLabels[id] ?? id.toUpperCase(),
}));

export const HistoryAudienceFilter = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { audiences: selectedAudiences = [], limit } =
		parseHistorySearchParams(searchParams);
	const selectedAudienceLabel = audienceOptions
		.filter(({ id }) => selectedAudiences.includes(id))
		.map(({ label }) => label)
		.join(', ');

	const handleAudienceChange = (audiences: string[]) => {
		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);
				nextSearchParams.delete('audience');
				for (const audience of audiences) {
					nextSearchParams.append('audience', audience);
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
				onSelectionChange={(selection) => {
					const keys =
						selection === 'all'
							? HISTORY_AUDIENCE_IDS
							: [...selection].flatMap((key) => {
									const parsed = notificationAudienceFilterId.safeParse(key);
									return parsed.success ? [parsed.data] : [];
								});
					handleAudienceChange(keys);
				}}
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

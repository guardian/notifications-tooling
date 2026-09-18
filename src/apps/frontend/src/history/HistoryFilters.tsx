import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Icon } from '@guardian/stand/Icon';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import {
	appAlertTopicEditionId,
	type AppAlertTopicEditionId,
	displayAppAlertTopicEditionId,
	toApiEditionId,
} from '@models';
import type { ChannelAudienceResponse } from '../schemas';
import { EDITION_OPTIONS } from '../segment/edition-options';
import { historyViewStyles } from '../themes';
import {
	HISTORY_AUDIENCE_IDS,
	MAXIMUM_SEARCH_LENGTH,
} from '../utils/history-search-params';

interface HistoryFiltersProps {
	audiences?: ChannelAudienceResponse;
	searchTerm: string;
	selectedAudiences: AppAlertTopicEditionId[];
	onSearchTermChange: (searchTerm: string) => void;
	onAudienceChange: (audiences: AppAlertTopicEditionId[]) => void;
	onClearFilters: () => void;
}

const getAudienceOptions = (audiences?: ChannelAudienceResponse) => {
	const labels = new Map<AppAlertTopicEditionId, string>(
		EDITION_OPTIONS.map(({ code, label }) => [toApiEditionId(code), label]),
	);

	for (const topic of audiences?.channels['app-push'].topicTypes ?? []) {
		for (const { id, label } of topic.editions) {
			const parsedId = appAlertTopicEditionId.safeParse(id);
			if (parsedId.success) {
				labels.set(parsedId.data, label);
			}
		}
	}
	for (const { id, label } of audiences?.channels.newsletter.segments ?? []) {
		const parsedId = displayAppAlertTopicEditionId.safeParse(id);
		if (parsedId.success) {
			labels.set(toApiEditionId(parsedId.data), label);
		}
	}

	return HISTORY_AUDIENCE_IDS.map((id) => ({
		id,
		label: labels.get(id) ?? id,
	}));
};

export const HistoryFilters = ({
	audiences,
	searchTerm,
	selectedAudiences,
	onSearchTermChange,
	onAudienceChange,
	onClearFilters,
}: HistoryFiltersProps) => (
	<aside aria-label="Filters" css={historyViewStyles.filters}>
		<button
			type="button"
			css={historyViewStyles.clearFilters}
			onClick={onClearFilters}
		>
			Clear all fields
		</button>
		<div css={historyViewStyles.filterFields}>
			<div css={historyViewStyles.searchField}>
				<TextInput
					label="Search"
					type="search"
					placeholder="Search"
					value={searchTerm}
					onChange={onSearchTermChange}
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
										const parsed = appAlertTopicEditionId.safeParse(key);
										return parsed.success ? [parsed.data] : [];
									});
						onAudienceChange(keys);
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
							<span id="history-audience-value">
								{selectedAudiences.length === 0
									? 'All'
									: `${selectedAudiences.length} selected`}
							</span>
							<Icon symbol="keyboard_arrow_down" size="lg" />
						</Button>
					</MenuToggle>
					{getAudienceOptions(audiences).map(({ id, label }) => (
						<MenuItem
							key={id}
							id={id}
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
		</div>
	</aside>
);

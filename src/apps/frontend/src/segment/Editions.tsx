import { Icon } from '@guardian/stand/Icon';
import {
	appAlertTopicEditionId,
	type AppAlertTopicOption,
	toApiEditionId,
	toDisplayEditionId,
} from '@models';
import { FlagAtom } from '../ui/FlagAtom';
import { PreviewPillList } from '../ui/PreviewPillList';
import { EDITION_OPTIONS } from './EditionOptions';

export interface AppPushTopicSelection {
	type: string;
	name: string;
}

interface EditionsProps {
	topicTypes: AppAlertTopicOption[];
	selected: AppPushTopicSelection[];
}

const selectionId = ({ type, name }: AppPushTopicSelection) =>
	`${type}:${name}`;

const editionLabels = Object.fromEntries(
	EDITION_OPTIONS.map(({ code, label }) => [toApiEditionId(code), label]),
);

export const Editions = ({ topicTypes, selected }: EditionsProps) => {
	const options = topicTypes.flatMap((topicType) =>
		topicType.editions.map((edition) => ({
			id: selectionId({ type: topicType.id, name: edition.id }),
			label: editionLabels[edition.id] ?? edition.label,
		})),
	);
	const selectedIds = selected.map(selectionId);
	return (
		<PreviewPillList
			title="Editions"
			options={options}
			selected={selectedIds}
			renderIcon={(id) => {
				const nameInId = id.slice(id.indexOf(':') + 1);
				const nameParsedToEditionId =
					appAlertTopicEditionId.safeParse(nameInId);
				const flagCode = nameParsedToEditionId.success
					? toDisplayEditionId(nameParsedToEditionId.data)
					: undefined;
				return flagCode ? (
					<FlagAtom segmentCode={flagCode} />
				) : (
					<Icon symbol="public" />
				);
			}}
		/>
	);
};

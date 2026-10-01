import { Icon } from '@guardian/stand/Icon';
import {
	appAlertTopicEditionId,
	type AppAlertTopicOption,
	toDisplayEditionId,
} from '@models';
import { FlagAtom } from '../ui/FlagAtom';
import { PreviewPillList } from '../ui/PreviewPillList';
import { FALLBACK_TOPIC_TYPES } from './audience-fallbacks';

export interface AppAlertTopicSelection {
	type: string;
	name: string;
}

interface EditionsProps {
	topicTypes: AppAlertTopicOption[];
	selected: AppAlertTopicSelection[];
}

// if the user hasn't selected an alertType, `type` will be an empty string
// provide a fallback alertType so the id will be in the options passed to PreviewPillList
const selectionId = ({ type, name }: AppAlertTopicSelection) =>
	`${!type ? FALLBACK_TOPIC_TYPES[0].id : type}:${name}`;

export const Editions = ({ topicTypes, selected }: EditionsProps) => {
	const options = topicTypes.flatMap((topicType) =>
		topicType.editions.map((edition) => ({
			id: selectionId({ type: topicType.id, name: edition.id }),
			label: edition.label,
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

import { Icon } from '@guardian/stand/Icon';
import type { AppAlertTopicOption } from '@models';
import { editionIds } from '../edition-values';
import type { Edition } from '../types';
import { EDITION_OPTIONS } from './EditionOptions';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';

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

const editionFlagCodes: Partial<Record<string, Edition>> = {
	uk: 'UK',
	us: 'US',
	au: 'AU',
	europe: 'EU',
	international: 'INT',
};

const editionLabels = Object.fromEntries(
	EDITION_OPTIONS.map(({ code, label }) => [editionIds[code], label]),
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
				const editionId = id.slice(id.indexOf(':') + 1);
				const flagCode = editionFlagCodes[editionId];
				return flagCode ? (
					<FlagAtom segmentCode={flagCode} />
				) : (
					<Icon symbol="public" />
				);
			}}
		/>
	);
};

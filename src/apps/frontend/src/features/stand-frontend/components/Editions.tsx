import { Icon } from '@guardian/stand/Icon';
import type { TopicTypeOption } from '../api/schemas';
import { editionIds } from '../edition-values';
import type { Edition } from '../types';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';
import { DEFAULT_EDITIONS } from './SelectableEditions';

export interface AppPushTopicSelection {
	type: string;
	name: string;
}

interface EditionsProps {
	topicTypes: TopicTypeOption[];
	selected: AppPushTopicSelection[];
}

const selectionId = ({ type, name }: AppPushTopicSelection) =>
	`${type}:${name}`;

const editionFlagCodes: Partial<Record<string, Edition>> = {
	uk: 'UK',
	us: 'US',
	au: 'AU',
	europe: 'EU',
	int: 'INT',
};

const editionLabels = Object.fromEntries(
	DEFAULT_EDITIONS.map(({ code, label }) => [editionIds[code], label]),
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

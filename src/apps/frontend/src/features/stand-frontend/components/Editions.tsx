import { Icon } from '@guardian/stand/Icon';
import type { TopicTypeOption } from '../api/schemas';
import type { AudienceSegment } from '../types';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';

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

const editionFlagCodes: Partial<Record<string, AudienceSegment>> = {
	uk: 'UK',
	us: 'US',
	au: 'AU',
};

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

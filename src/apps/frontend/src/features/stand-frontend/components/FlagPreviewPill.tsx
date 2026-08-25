import type { AudienceSegment, Edition } from '../types';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';

interface FlagPreviewPillOption<Code extends AudienceSegment | Edition> {
	code: Code;
	label: string;
}

interface FlagPreviewPillProps<Code extends AudienceSegment | Edition> {
	title: string;
	options: Array<FlagPreviewPillOption<Code>>;
	selected: Code[];
	isConfirmation?: boolean;
}

export const FlagPreviewPill = <Code extends AudienceSegment | Edition>({
	title,
	options,
	selected,
	isConfirmation = false,
}: FlagPreviewPillProps<Code>) => (
	<PreviewPillList
		title={title}
		options={options.map(({ code, label }) => ({ id: code, label }))}
		selected={selected}
		isConfirmation={isConfirmation}
		renderIcon={(code) => <FlagAtom segmentCode={code} />}
	/>
);

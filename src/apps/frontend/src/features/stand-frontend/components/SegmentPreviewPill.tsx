import type { AudienceSegment, Edition } from '../types';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';
import type { SelectableOption } from './SelectablePillGrid';

interface SegmentPreviewPillProps<Code extends AudienceSegment | Edition> {
	title: string;
	options: Array<SelectableOption<Code>>;
	selected: Code[];
	isConfirmation?: boolean;
}

export const SegmentPreviewPill = <Code extends AudienceSegment | Edition>({
	title,
	options,
	selected,
	isConfirmation = false,
}: SegmentPreviewPillProps<Code>) => (
	<PreviewPillList
		title={title}
		options={options.map(({ code, label }) => ({ id: code, label }))}
		selected={selected}
		isConfirmation={isConfirmation}
		renderIcon={(code) => <FlagAtom segmentCode={code} />}
	/>
);

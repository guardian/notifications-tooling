import type { AudienceSegment, Edition } from '../types';
import { FlagAtom } from './FlagAtom';
import {
	type SelectableOption,
	SelectablePillGrid,
} from './SelectablePillGrid';

interface SegmentPickerProps<Code extends AudienceSegment | Edition> {
	title: string;
	description: string;
	options: Array<SelectableOption<Code>>;
	selected: Code[];
	onChange: (selected: Code[]) => void;
	error?: string;
}

export const SegmentPicker = <Code extends AudienceSegment | Edition>({
	title,
	description,
	options,
	selected,
	onChange,
	error,
}: SegmentPickerProps<Code>) => (
	<SelectablePillGrid
		title={title}
		description={description}
		options={options}
		selected={selected}
		onChange={onChange}
		renderIcon={(code) => <FlagAtom segmentCode={code} />}
		error={error}
	/>
);

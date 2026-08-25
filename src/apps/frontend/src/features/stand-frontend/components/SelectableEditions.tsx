import { type Edition } from '../types';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';
import { SegmentPicker } from './SegmentPicker';

export interface Segment {
	code: Edition;
	label: string;
}

interface SelectableEditionsPickerProps {
	title?: string;
	description?: string;
	segments?: Segment[];
	selected: Edition[];
	onChange: (selected: Edition[]) => void;
	error?: string;
}

interface EditionsPreviewPillProps {
	segments?: Segment[];
	selected: Edition[];
	isConfirmation?: boolean;
}

export const DEFAULT_EDITIONS: Segment[] = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
	{ code: 'EU', label: 'Europe' },
	{ code: 'INT', label: 'International' },
];

export const SelectableEditions = ({
	title,
	description,
	segments = DEFAULT_EDITIONS,
	selected,
	onChange,
	error,
}: SelectableEditionsPickerProps) => (
	<SegmentPicker
		title={title}
		description={description}
		options={segments}
		selected={selected}
		onChange={onChange}
		error={error}
	/>
);

export const EditionsPreviewPill = ({
	segments = DEFAULT_EDITIONS,
	selected,
	isConfirmation = false,
}: EditionsPreviewPillProps) => (
	<PreviewPillList
		title="Editions"
		options={segments.map(({ code, label }) => ({ id: code, label }))}
		selected={selected}
		isConfirmation={isConfirmation}
		renderIcon={(editionCode) => <FlagAtom segmentCode={editionCode} />}
	/>
);

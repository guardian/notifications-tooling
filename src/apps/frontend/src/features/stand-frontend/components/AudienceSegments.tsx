import { type AudienceSegment } from '../types';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';
import { SegmentPicker } from './SegmentPicker';

export interface Segment {
	code: AudienceSegment;
	label: string;
}

interface AudienceSegmentPickerProps {
	segments?: Segment[];
	selected: AudienceSegment[];
	onChange: (selected: AudienceSegment[]) => void;
	error?: string;
}

interface AudienceSegmentsPreviewPillProps {
	segments?: Segment[];
	selected: AudienceSegment[];
	isConfirmation?: boolean;
}

export const DEFAULT_SEGMENTS: Segment[] = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];

export const AudienceSegments = ({
	segments = DEFAULT_SEGMENTS,
	selected,
	onChange,
	error,
}: AudienceSegmentPickerProps) => (
	<SegmentPicker
		title="Audience segments"
		description="Choose the audience the email notification will be sent to"
		options={segments}
		selected={selected}
		onChange={onChange}
		error={error}
	/>
);

export const AudienceSegmentsPreviewPill = ({
	segments = DEFAULT_SEGMENTS,
	selected,
	isConfirmation = false,
}: AudienceSegmentsPreviewPillProps) => (
	<PreviewPillList
		title="Audience segments"
		options={segments.map(({ code, label }) => ({ id: code, label }))}
		selected={selected}
		isConfirmation={isConfirmation}
		renderIcon={(segmentCode) => <FlagAtom segmentCode={segmentCode} />}
	/>
);

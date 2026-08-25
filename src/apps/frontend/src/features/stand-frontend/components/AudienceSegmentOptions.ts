import type { AudienceSegment } from '../types';
import type { SegmentOption } from './SegmentPicker';

export const SEGMENT_OPTIONS: Array<SegmentOption<AudienceSegment>> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];

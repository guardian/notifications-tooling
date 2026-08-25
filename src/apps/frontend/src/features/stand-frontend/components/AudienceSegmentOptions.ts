import type { AudienceSegment } from '../types';
import type { SegmentOption } from './SegmentPicker';

export const DEFAULT_SEGMENTS: Array<SegmentOption<AudienceSegment>> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];

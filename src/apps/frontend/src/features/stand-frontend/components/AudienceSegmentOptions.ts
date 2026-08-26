import type { NewsletterSegmentId } from '@models';
import type { SegmentOption } from './SegmentPicker';

export const SEGMENT_OPTIONS: Array<SegmentOption<NewsletterSegmentId>> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];

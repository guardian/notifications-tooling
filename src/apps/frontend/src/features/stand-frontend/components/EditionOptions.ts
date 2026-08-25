import type { Edition } from '../types';
import type { SegmentOption } from './SegmentPicker';

export const DEFAULT_EDITIONS: Array<SegmentOption<Edition>> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
	{ code: 'EU', label: 'Europe' },
	{ code: 'INT', label: 'International' },
];

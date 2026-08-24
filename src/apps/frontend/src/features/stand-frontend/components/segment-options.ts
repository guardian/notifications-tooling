import type { AudienceSegment, Edition } from '../types';
import type { SelectableOption } from './SelectablePillGrid';

export const DEFAULT_SEGMENTS: Array<SelectableOption<AudienceSegment>> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];

export const DEFAULT_EDITIONS: Array<SelectableOption<Edition>> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
	{ code: 'EU', label: 'EU' },
	{ code: 'INT', label: 'International' },
];

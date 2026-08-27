import type { FrontendAppAlertTopicEditionId } from '@models';
import type { SegmentOption } from './SegmentPicker';

export const EDITION_OPTIONS: Array<
	SegmentOption<FrontendAppAlertTopicEditionId>
> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
	{ code: 'EU', label: 'Europe' },
	{ code: 'INT', label: 'International' },
];

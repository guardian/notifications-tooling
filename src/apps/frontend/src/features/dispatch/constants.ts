import type { IconProps } from '@guardian/stand/Icon';
import type { DeliveryMode, SegmentId } from './types';

/** Character limits mirrored from the email service provider constraints. */
export const SUBJECT_MAX_LENGTH = 100;
export const PREVIEW_MAX_LENGTH = 280;

export interface SegmentOption {
	id: SegmentId;
	code: string;
	label: string;
}

/** Audience segments shown as toggle pills on the Audience tab. */
export const SEGMENT_OPTIONS: SegmentOption[] = [
	{ id: 'UK', code: 'UK', label: 'United Kingdom' },
	{ id: 'US', code: 'US', label: 'United States' },
	{ id: 'AU', code: 'AU', label: 'Australia' },
	{ id: 'EU', code: 'EU', label: 'Europe' },
	{ id: 'ALL', code: 'ALL', label: 'Global' },
];

export interface DeliveryOption {
	id: DeliveryMode;
	icon: IconProps['symbol'];
	title: string;
	description: string;
}

/** Delivery & timing strategies shown as radio cards on the Delivery tab. */
export const DELIVERY_OPTIONS: DeliveryOption[] = [
	{
		id: 'immediate',
		icon: 'bolt',
		title: 'Immediate',
		description: 'Send right now via Braze',
	},
	{
		id: 'scheduled',
		icon: 'schedule',
		title: 'Scheduled',
		description: 'Pick a date and time',
	},
	{
		id: 'intelligent',
		icon: 'psychology',
		title: 'Intelligent',
		description: 'Braze sends per-subscriber',
	},
];

/** Human-readable summary of a delivery mode, used in the routing panel. */
export const DELIVERY_SUMMARY: Record<DeliveryMode, string> = {
	immediate: 'Immediate send via Braze',
	scheduled: 'Scheduled send via Braze',
	intelligent: 'Intelligent send via Braze',
};

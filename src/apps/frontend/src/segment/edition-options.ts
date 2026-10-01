import {
	type DisplayAppAlertTopicEditionId,
	toDisplayEditionId,
} from '@models';
import { FALLBACK_TOPIC_TYPES } from './audience-fallbacks';
import type { SegmentOption } from './SegmentPicker';

export const EDITION_OPTIONS: Array<
	SegmentOption<DisplayAppAlertTopicEditionId>
> = FALLBACK_TOPIC_TYPES[0].editions.map(({ id, label }) => ({
	code: toDisplayEditionId(id),
	label,
}));

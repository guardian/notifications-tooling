import type {
	DisplayAppAlertTopicEditionId,
	NewsletterSegmentId,
} from '@models';
import { FlagAtom } from '../ui/FlagAtom';
import { PreviewPillList } from '../ui/PreviewPillList';

interface FlagPreviewPillOption<
	Code extends NewsletterSegmentId | DisplayAppAlertTopicEditionId,
> {
	code: Code;
	label: string;
}

interface FlagPreviewPillProps<
	Code extends NewsletterSegmentId | DisplayAppAlertTopicEditionId,
> {
	title: string;
	options: Array<FlagPreviewPillOption<Code>>;
	selected: Code[];
	muted?: boolean;
	showTitle?: boolean;
}

export const FlagPreviewPill = <
	Code extends NewsletterSegmentId | DisplayAppAlertTopicEditionId,
>({
	title,
	options,
	selected,
	muted = false,
	showTitle = true,
}: FlagPreviewPillProps<Code>) => (
	<PreviewPillList
		title={title}
		options={options.map(({ code, label }) => ({ id: code, label }))}
		selected={selected}
		muted={muted}
		showTitle={showTitle}
		renderIcon={(code) => <FlagAtom segmentCode={code} />}
	/>
);

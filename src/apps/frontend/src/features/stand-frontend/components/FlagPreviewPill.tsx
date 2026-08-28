import type { AppAlertTopicEditionId, NewsletterSegmentId } from '@models';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';

interface FlagPreviewPillOption<
	Code extends NewsletterSegmentId | AppAlertTopicEditionId,
> {
	code: Code;
	label: string;
}

interface FlagPreviewPillProps<
	Code extends NewsletterSegmentId | AppAlertTopicEditionId,
> {
	title: string;
	options: Array<FlagPreviewPillOption<Code>>;
	selected: Code[];
	isConfirmation?: boolean;
}

export const FlagPreviewPill = <
	Code extends NewsletterSegmentId | AppAlertTopicEditionId,
>({
	title,
	options,
	selected,
	isConfirmation = false,
}: FlagPreviewPillProps<Code>) => (
	<PreviewPillList
		title={title}
		options={options.map(({ code, label }) => ({ id: code, label }))}
		selected={selected}
		isConfirmation={isConfirmation}
		renderIcon={(code) => <FlagAtom segmentCode={code} />}
	/>
);

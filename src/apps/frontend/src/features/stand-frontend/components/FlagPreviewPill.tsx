import type {
	FrontendAppAlertTopicEditionId,
	NewsletterSegmentId,
} from '@models';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';

interface FlagPreviewPillOption<
	Code extends NewsletterSegmentId | FrontendAppAlertTopicEditionId,
> {
	code: Code;
	label: string;
}

interface FlagPreviewPillProps<
	Code extends NewsletterSegmentId | FrontendAppAlertTopicEditionId,
> {
	title: string;
	options: Array<FlagPreviewPillOption<Code>>;
	selected: Code[];
	isConfirmation?: boolean;
}

export const FlagPreviewPill = <
	Code extends NewsletterSegmentId | FrontendAppAlertTopicEditionId,
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

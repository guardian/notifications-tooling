import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useContext, useState } from 'react';
import type { TopicTypeOption } from '../api/schemas';
import { NotificationFormContext } from '../NotificationContext';
import { AppPreviewSection } from './AppPreviewSection';
import type { AppPushTopicSelection } from './Editions';
import { EmailPreviewSection } from './EmailPreviewSection';

interface PreviewToggleProps {
	children: ReactNode;
}

const PreviewToggle = ({ children }: PreviewToggleProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div
			css={css({
				display: 'flex',
				flexDirection: 'column',
				['@media (min-width: 1280px)']: {
					display: 'none',
				},
				borderBottom: `2px solid ${semanticColors.border.weak}`,
			})}
		>
			<button
				type="button"
				aria-expanded={isExpanded}
				onClick={() => setIsExpanded((expanded) => !expanded)}
				css={css({
					alignItems: 'center',
					background: semanticColors.bg.raisedLevel1,
					border: 0,
					color: semanticColors.text.strong,
					cursor: 'pointer',
					display: 'flex',
					justifyContent: 'space-between',
					padding: semanticSpacing.stackSm,
					width: '100%',
				})}
			>
				<Typography variant="bodyBoldMd">Preview</Typography>
				<Icon
					symbol={isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
				/>
			</button>

			{isExpanded && children}
		</div>
	);
};

export const AppPreviewToggle = ({
	topicTypes,
	selectedTopics,
}: {
	topicTypes: TopicTypeOption[];
	selectedTopics: AppPushTopicSelection[];
}) => (
	<PreviewToggle>
		<AppPreviewSection
			topicTypes={topicTypes}
			selectedTopics={selectedTopics}
		/>
	</PreviewToggle>
);

export const EmailPreviewToggle = () => {
	const { notification } = useContext(NotificationFormContext);
	const emailParameters =
		notification.parameters?.type === 'email'
			? notification.parameters
			: undefined;
	const selectedSegments = emailParameters?.audienceSegments ?? [];
	const selectedChannel = emailParameters?.type;
	const selectedDeliveryTiming =
		emailParameters?.emailDeliveryOption ?? undefined;

	return (
		<PreviewToggle>
			<EmailPreviewSection
				selectedSegments={selectedSegments}
				selectedChannel={selectedChannel}
				selectedDeliveryTiming={selectedDeliveryTiming}
			/>
		</PreviewToggle>
	);
};

import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { EmailPreviewSection } from './EmailPreviewSection';

export const PreviewToggle = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { notification } = useContext(NotificationFormContext);

	const selectedSegments = notification.parameters?.audienceSegments ?? [];
	const selectedChannel = notification.parameters?.type;
	const selectedDeliveryTiming =
		notification.parameters?.type === 'email'
			? notification.parameters.emailDeliveryOption
			: undefined;

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

			{isExpanded && (
				<EmailPreviewSection
					selectedSegments={selectedSegments}
					selectedChannel={selectedChannel}
					selectedDeliveryTiming={selectedDeliveryTiming}
				/>
			)}
		</div>
	);
};

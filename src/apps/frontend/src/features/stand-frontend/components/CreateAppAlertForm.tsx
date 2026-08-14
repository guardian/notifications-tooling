import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { PropsWithChildren } from 'react';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { topBarHeight } from '../themes';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelSelector } from './ChannelSelector';
import { SendButton } from './SendButton';
import { SendFailedModal } from './SendFailedModal';
import { SendNotificationModal } from './SendNotificationModal';

const NotificationFormSection = ({
	id,
	isActive,
	children,
}: PropsWithChildren<{ id: string; isActive: boolean }>) => (
	<section
		id={id}
		data-scrollspy-active={isActive ? '' : undefined}
		css={css({
			display: 'flex',
			flexDirection: 'column',
			gap: semanticSpacing.stackMd,
			borderLeft: `${semanticSizing.border.md} solid transparent`,
			paddingLeft: semanticSpacing.stackMd,
			scrollMarginTop: topBarHeight,
			'&[data-scrollspy-active]': {
				borderLeftColor: baseColors.magenta[200],
			},
		})}
	>
		{children}
	</section>
);

interface CreateAppAlertFormProps {
	activeSectionHref: string;
}

export const CreateAppAlertForm = ({
	activeSectionHref,
}: CreateAppAlertFormProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	return (
		<div
			css={{
				marginTop: semanticSpacing.stackXl,
				marginBottom: semanticSpacing.stackXl,
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXl,
			}}
		>
			<Typography variant="heading2Xl" element="h2">
				Create app alert
			</Typography>

			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
					width: '100%',
					[from.md]: {
						width: '476px',
					},
				}}
			>
				<NotificationFormSection
					id="article-section"
					isActive={activeSectionHref === '#article-section'}
				>
					<ArticleImportControl />

					<ChannelSelector
						selectedChannel={notification.parameters?.type ?? 'push'}
						onChange={(channel) => {
							switch (channel) {
								case 'email':
								case 'push':
									updateNotification({ type: 'set-channel', channel });
									break;
							}
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="send-button-section"
					isActive={activeSectionHref === '#send-button-section'}
				>
					<SendButton />
				</NotificationFormSection>
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};

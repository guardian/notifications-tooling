import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { PropsWithChildren } from 'react';
import { useContext } from 'react';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { NotificationFormContext } from '../NotificationContext';
import { topBarHeight } from '../themes';
import type { DeliveryOption } from '../types';
import type { ChannelOption } from '../types';
import { AlertEditionsSection } from './AlertEditionsSection';
import { AppAlertFields } from './AppAlertFields';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelSelector } from './ChannelSelector';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
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
	const { updateNotification } = useContext(NotificationFormContext);

	const { data: constraints } = useChannelConstraints();

	const channel = 'push'; //TODO - change to notification.parameters.type
	const pushDeliveryOption = 'appImmediate'; //TODO - change to notification.parameters.pushDeliveryOption
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
						selectedChannel={channel} //TODO -change to notification.parameters.type
						onChange={(channel) => {
							updateNotification({
								type: 'set-channel',
								channel: channel as ChannelOption,
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="alert-section"
					isActive={activeSectionHref === '#alert-section'}
				>
					<AlertEditionsSection />
				</NotificationFormSection>
				<NotificationFormSection
					id="headline-section"
					isActive={activeSectionHref === '#headline-section'}
				>
					<AppAlertFields constraints={constraints} />
				</NotificationFormSection>
				<NotificationFormSection
					id="delivery-timing-section"
					isActive={activeSectionHref === '#delivery-timing-section'}
				>
					<DeliveryAndTimingSelector
						selectedDeliveryTiming={pushDeliveryOption}
						channel={channel} //TODO - change to notification.parameters.type
						onChange={(pushDeliveryOption) => {
							updateNotification({
								type: 'set-delivery-timing',
								deliveryOption: pushDeliveryOption as DeliveryOption,
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="send-button-section"
					isActive={activeSectionHref === '#send-button-section'}
				>
					<SendButton channel={channel} />
				</NotificationFormSection>
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};

import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { PropsWithChildren } from 'react';
import { useContext } from 'react';
import { useChannelAudiences } from '../api/useChannelAudiences';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { validateNotificationForm } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { topBarHeight } from '../themes';
import type { ChannelOption, DeliveryOption } from '../types';
import { ArticleImportControl } from './ArticleImportControl';
import { AudienceSegments } from './AudienceSegments';
import { ChannelSelector } from './ChannelSelector';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
import { EmailFields } from './EmailFields';
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

interface CreateNotificationFormProps {
	activeSectionHref: string;
}

export const CreateNotificationForm = ({
	activeSectionHref,
}: CreateNotificationFormProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const { data: constraints } = useChannelConstraints();
	const { data: audiences } = useChannelAudiences();

	console.log('audiences', audiences);

	if (!notification.parameters) {
		return null;
	}

	const channel = notification.parameters.type;
	const emailDeliveryOption =
		notification.parameters.type === 'email'
			? (notification.parameters.emailDeliveryOption ?? 'immediate')
			: undefined;
	const audienceSegments = notification.parameters.audienceSegments ?? [];
	const requiredFieldErrors = validateNotificationForm(notification);
	const shouldShowErrors = notification.hasAttemptedSend;

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
				Create newsletter email
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
						selectedChannel={channel}
						onChange={(channel) => {
							updateNotification({
								type: 'set-channel',
								channel: channel as ChannelOption,
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="content-section"
					isActive={activeSectionHref === '#content-section'}
				>
					<EmailFields constraints={constraints} />
				</NotificationFormSection>
				<NotificationFormSection
					id="audience-section"
					isActive={activeSectionHref === '#audience-section'}
				>
					<AudienceSegments
						selected={audienceSegments}
						error={
							shouldShowErrors &&
							requiredFieldErrors.includes('audienceSegments')
								? 'Please select an audience segment'
								: undefined
						}
						onChange={(audienceSegments) => {
							updateNotification({
								type: 'modify-email-parameters',
								mod: { audienceSegments },
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="delivery-timing-section"
					isActive={activeSectionHref === '#delivery-timing-section'}
				>
					<DeliveryAndTimingSelector
						selectedDeliveryTiming={emailDeliveryOption}
						channel={channel} //TODO - change to notification.parameters.type
						onChange={(emailDeliveryOption) => {
							updateNotification({
								type: 'set-delivery-timing',
								deliveryOption: emailDeliveryOption as DeliveryOption,
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

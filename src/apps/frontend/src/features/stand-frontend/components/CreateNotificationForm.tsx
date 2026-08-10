import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { validateNotificationForm } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import type { ActiveSection } from '../types';
import { ArticleImportControl } from './ArticleImportControl';
import { AudienceSegments } from './AudienceSegments';
import { ChannelSelector } from './ChannelSelector';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
import { EmailFields } from './EmailFields';
import { SendButton } from './SendButton';
import { SendFailedModal } from './SendFailedModal';
import { SendNotificationModal } from './SendNotificationModal';

const createNotificationFormStyles = {
	sectionStyle: (activeSectionStyle: string | undefined) =>
		css({
			display: 'flex',
			flexDirection: 'column',
			gap: semanticSpacing.stackMd,
			borderLeft: activeSectionStyle,
			paddingLeft: semanticSpacing.stackMd,
		}),
};
export const CreateNotificationForm = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	// Called before the early return: hooks cannot sit behind a conditional.
	const { data: constraints } = useChannelConstraints();

	if (!notification.parameters) {
		return null;
	}

	const audienceSegments = notification.parameters.audienceSegments ?? [];
	const emailDeliveryOption =
		notification.parameters.type === 'email'
			? notification.parameters.emailDeliveryOption
			: undefined;
	const requiredFieldErrors = validateNotificationForm(notification);
	const shouldShowErrors = notification.hasAttemptedSend;
	const activeSection = notification.activeSection;

	const getSectionBorder = (sectionId: ActiveSection) =>
		activeSection === sectionId
			? `${semanticSizing.border.md} solid ${baseColors.magenta[200]}`
			: undefined;

	return (
		<div
			css={{
				marginTop: semanticSpacing.stackXl,
				marginBottom: semanticSpacing.stackXl,
				display: 'flex',
				flexDirection: 'column',
				width: '720px',
				paddingRight: semanticSpacing.stackSm,
				paddingLeft: '147px',
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
					width: '476px',
				}}
			>
				<section
					id="article-section"
					css={createNotificationFormStyles.sectionStyle(
						getSectionBorder('#article-section'),
					)}
				>
					<ArticleImportControl />

					<ChannelSelector
						selectedChannel={notification.parameters.type}
						onChange={(channel) => {
							switch (channel) {
								case 'email':
								case 'push':
									updateNotification({ type: 'set-channel', channel });
									break;
							}
						}}
					/>
				</section>
				<section
					id="content-section"
					css={createNotificationFormStyles.sectionStyle(
						getSectionBorder('#content-section'),
					)}
				>
					<EmailFields constraints={constraints} />
				</section>
				<section
					id="audience-section"
					css={createNotificationFormStyles.sectionStyle(
						getSectionBorder('#audience-section'),
					)}
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
				</section>
				<section
					id="delivery-timing-section"
					css={createNotificationFormStyles.sectionStyle(
						getSectionBorder('#delivery-timing-section'),
					)}
				>
					<DeliveryAndTimingSelector
						selectedDeliveryTiming={emailDeliveryOption}
						channel={notification.parameters.type}
						onChange={(emailDeliveryOption) => {
							updateNotification({
								type: 'modify-email-parameters',
								mod: { emailDeliveryOption },
							});
						}}
					/>
				</section>
				<section
					id="send-button-section"
					css={createNotificationFormStyles.sectionStyle(
						getSectionBorder('#send-button-section'),
					)}
				>
					<SendButton />
				</section>
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};

import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { emailDeliveryOptionNameMap } from '../option-values';
import type { AudienceSegment } from '../types';
import {
	AudienceSegmentsPreviewPill,
	DEFAULT_SEGMENTS,
} from './AudienceSegments';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: baseSpacing['8Px'],
		marginTop: '52px',
		marginLeft: '171px',
		maxWidth: '720px',
	}),
	parameter: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
	}),
	detailsBox: css({
		borderWidth: semanticSizing.border.default,
		borderStyle: 'solid',
		borderColor: semanticColors.border.weak,
		margin: `${semanticSpacing.stackLg} 0`,

		header: {
			padding: semanticSpacing.stackSm,
			backgroundColor: semanticColors.fill.successWeak,
		},
		section: {
			padding: semanticSpacing.stackSm,
			display: 'flex',
			flexDirection: 'column',
			gap: semanticSpacing.stackSm,
		},
	}),
	greenCheckIconStyle: css({
		paddingTop: '2.33px',
		paddingLeft: '2.33px',
		color: semanticColors.fill.successStrong,
	}),
};

const ParameterDisplay = ({
	keyName,
	value,
}: {
	keyName: string;
	value: string | AudienceSegment[];
}) => {
	//This is temporary solution to display the delivery time in the confirmation page.
	const tempTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
	const tempDate = new Date().toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	});
	const temporaryDeliveryTime = `${tempTime} (ET), ${tempDate}`;

	return (
		<div css={styles.parameter}>
			<Typography variant="bodyBoldMd">{keyName}:</Typography>
			{keyName === 'Channel' && (
				<SendInfoPreviewPill channel={'email'} isConfirmation={true} />
			)}
			{keyName === 'Audience segment' && (
				<AudienceSegmentsPreviewPill
					segments={DEFAULT_SEGMENTS}
					selected={value as AudienceSegment[]}
					isConfirmation={true}
				/>
			)}
			{keyName === 'Delivery' && (
				<div
					css={{
						display: 'flex',
						flexDirection: 'row',
						gap: semanticSpacing.stackSm,
					}}
				>
					<SendInfoPreviewPill
						deliveryTiming={'immediate'}
						isConfirmation={true}
					/>
					<div
						css={{
							display: 'flex',
							flexDirection: 'row',
							gap: semanticSpacing.stackSm,
							alignItems: 'center',
							height: semanticSizing.height.sm,
							border: `${semanticSizing.border.default} solid ${semanticColors.border.weaker}`,
							borderRadius: semanticRadius.cornerSm,
							padding: `0 ${semanticSpacing.stackSm}`,
						}}
					>
						<Icon size="md">clock_loader_40</Icon>
						<Typography variant="bodySm" css={{ height: '18px' }}>
							{temporaryDeliveryTime}
						</Typography>
					</div>
				</div>
			)}
		</div>
	);
};

export const DispatchReport = () => {
	const { updateNotification, notification } = useContext(
		NotificationFormContext,
	);

	const { sendingResult } = notification;

	const notificationDescription =
		notification.parameters?.type === 'email'
			? 'email newsletter'
			: 'push notification';

	const wasSuccess = !!sendingResult?.ok;
	return (
		<section css={styles.container}>
			{wasSuccess ? (
				<>
					<div>
						<div
							css={{
								display: 'flex',
								flexDirection: 'row',
								gap: semanticSpacing.stackXs,
							}}
						>
							<Icon size="lg" cssOverrides={styles.greenCheckIconStyle}>
								check_circle
							</Icon>
							<Typography
								variant="heading2Xl"
								element="h2"
								css={{ fontSize: '24px' }}
							>
								Email newsletter sent
							</Typography>
						</div>
						<Typography variant="bodyMd" css={{ fontSize: '16px' }}>
							Notification confirmation details below
						</Typography>
					</div>

					<div css={styles.detailsBox}>
						<header>
							<Typography variant="headingMd">Details</Typography>
						</header>

						{notification.parameters?.type === 'email' && (
							<section>
								<ParameterDisplay keyName="Channel" value="Email Newsletter" />
								<ParameterDisplay
									keyName="Audience segment"
									value={notification.parameters.audienceSegments ?? []}
								/>
								<div></div>
								<ParameterDisplay
									keyName="Delivery"
									value={
										notification.parameters.emailDeliveryOption
											? emailDeliveryOptionNameMap[
													notification.parameters.emailDeliveryOption
												].name
											: ''
									}
								/>
							</section>
						)}
					</div>
					<div
						css={{
							display: 'flex',
							flexDirection: 'row',
							flow: 'horizontal',
							gap: semanticSpacing.stackMd,
							width: '720px',
							height: '40px',
						}}
					>
						<Button
							variant="primary"
							onClick={() => updateNotification({ type: 'reset' })}
						>
							Done
						</Button>
						<Button
							variant="tertiary"
							onClick={() => console.log('Copy to App alert')}
						>
							Copy to App alert
						</Button>
					</div>
				</>
			) : (
				<>
					<div>
						<Typography variant="heading2Xl" element="h2">
							Send Failed
						</Typography>
						<InlineMessage level="error">
							The {notificationDescription} failed to send
						</InlineMessage>
					</div>
					<div css={styles.detailsBox}>
						<header>
							<Typography variant="headingMd">Details</Typography>
						</header>

						<section>
							<ParameterDisplay keyName="Reason" value="UNKNOWN" />
						</section>
					</div>
				</>
			)}
		</section>
	);
};

import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { emailDeliveryOptionNameMap, kickerNameMap } from '../option-values';
import type { AudienceSegment } from '../types';
import {
	AudienceSegmentsPreviewPill,
	DEFAULT_SEGMENTS,
} from './AudienceSegments';

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackLg,
		maxWidth: 668,
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

		header: {
			padding: semanticSpacing.stackSm,
			backgroundColor: semanticColors.fill.neutralWeak,
		},
		section: {
			padding: semanticSpacing.stackSm,
			display: 'flex',
			flexDirection: 'column',
			gap: semanticSpacing.stackSm,
		},
	}),
};

const ParameterDisplay = ({
	keyName,
	value,
}: {
	keyName: string;
	value: string | AudienceSegment[];
}) => {
	return (
		<div css={styles.parameter}>
			<Typography variant="bodyBoldMd">{keyName}:</Typography>
			{keyName !== 'Audience' && <Typography>{value}</Typography>}
			{keyName === 'Audience' && (
				<AudienceSegmentsPreviewPill
					segments={DEFAULT_SEGMENTS}
					selected={value as AudienceSegment[]}
					isConfirmation={true}
				/>
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
						<Typography variant="heading2Xl" element="h2">
							Confirmation
						</Typography>
						<Typography>
							The sent {notificationDescription} details can be seen below
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
									keyName="Kicker"
									value={
										kickerNameMap[notification.parameters.kicker ?? 'undefined']
									}
								/>
								<ParameterDisplay
									keyName="Audience"
									value={notification.parameters.audienceSegments ?? []}
								/>
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

			<div>
				<Button onClick={() => updateNotification({ type: 'reset' })}>
					Done
				</Button>
			</div>
		</section>
	);
};

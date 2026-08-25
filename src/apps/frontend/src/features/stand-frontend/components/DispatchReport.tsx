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
import { Typography } from '@guardian/stand/Typography';
import { type ReactNode, useContext } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
	capitalise,
	getChannelDescription,
} from '../../../util/display-text-helpers';
import {
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
} from '../notification-forms';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import type { DeliveryOption } from '../types';
import { SEGMENT_OPTIONS } from './AudienceSegmentOptions';
import { EDITION_OPTIONS } from './EditionOptions';
import { scheduleIcon } from './FlagIcons';
import { FlagPreviewPill } from './FlagPreviewPill';
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
		borderTopLeftRadius: semanticRadius.cornerSm,
		borderTopRightRadius: semanticRadius.cornerSm,
		overflow: 'hidden',
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

const ParameterLabel = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div css={styles.parameter}>
		<Typography variant="bodyBoldMd">{label}:</Typography>
		{children}
	</div>
);

const DeliveryParameter = ({
	deliveryTiming,
}: {
	deliveryTiming: DeliveryOption;
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
		<ParameterLabel label="Delivery and time">
			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					gap: semanticSpacing.stackSm,
				}}
			>
				<SendInfoPreviewPill
					deliveryTiming={deliveryTiming}
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
					<Icon size="md" css={{ paddingTop: '1.67px', paddingLeft: '1.67px' }}>
						{scheduleIcon}
					</Icon>
					<Typography variant="bodySm" css={{ height: '18px' }}>
						{temporaryDeliveryTime}
					</Typography>
				</div>
			</div>
		</ParameterLabel>
	);
};

export const NewsletterDispatchDetails = () => {
	const audienceSegments = useWatch<NewsletterFormValues, 'audienceSegments'>({
		name: 'audienceSegments',
		defaultValue: defaultNewsletterFormValues.audienceSegments,
	});
	const deliveryOption = useWatch<NewsletterFormValues, 'deliveryOption'>({
		name: 'deliveryOption',
		defaultValue: defaultNewsletterFormValues.deliveryOption,
	});

	return (
		<section>
			<ParameterLabel label="Channel">
				<SendInfoPreviewPill channel="email" isConfirmation={true} />
			</ParameterLabel>
			<ParameterLabel label="Audience segments">
				<FlagPreviewPill
					title="Audience segments"
					options={SEGMENT_OPTIONS}
					selected={audienceSegments}
					isConfirmation={true}
				/>
			</ParameterLabel>
			<DeliveryParameter deliveryTiming={deliveryOption} />
		</section>
	);
};

export const AppAlertDispatchDetails = () => {
	const editions = useWatch<AppAlertFormValues, 'editions'>({
		name: 'editions',
		defaultValue: defaultAppAlertFormValues.editions,
	});
	const deliveryOption = useWatch<AppAlertFormValues, 'deliveryOption'>({
		name: 'deliveryOption',
		defaultValue: defaultAppAlertFormValues.deliveryOption,
	});

	return (
		<section>
			<ParameterLabel label="Channel">
				<SendInfoPreviewPill channel="push" isConfirmation={true} />
			</ParameterLabel>
			<ParameterLabel label="Editions">
				<FlagPreviewPill
					title="Editions"
					options={EDITION_OPTIONS}
					selected={editions}
					isConfirmation={true}
				/>
			</ParameterLabel>
			<DeliveryParameter deliveryTiming={deliveryOption} />
		</section>
	);
};

interface DispatchReportProps {
	children: ReactNode;
	onResetNotification: () => void;
}

export const DispatchReport = ({
	children,
	onResetNotification,
}: DispatchReportProps) => {
	const { channel, notification } = useContext(NotificationFormContext);
	const { reset } = useFormContext();
	const { sendingResult } = notification;

	if (!sendingResult?.success) {
		return null;
	}

	const notificationDescription = capitalise(getChannelDescription(channel));

	return (
		<section css={styles.container}>
			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackSm,
				}}
			>
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
						{notificationDescription} sent
					</Typography>
				</div>
				<Typography variant="bodyMd" css={{ fontSize: '16px' }}>
					Confirmation details below
				</Typography>
			</div>

			<div css={styles.detailsBox}>
				<header>
					<Typography variant="headingMd">Details</Typography>
				</header>

				{children}
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
					onClick={() => {
						reset();
						onResetNotification();
					}}
				>
					Create new {getChannelDescription(channel)}
				</Button>
			</div>
		</section>
	);
};

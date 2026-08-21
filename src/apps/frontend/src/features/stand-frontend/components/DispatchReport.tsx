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
import type { ReactNode } from 'react';
import { useContext } from 'react';
import {
	capitalise,
	getChannelDescription,
} from '../../../util/display-text-helpers';
import { NotificationFormContext } from '../NotificationContext';
import type { DeliveryOption } from '../types';
import {
	AudienceSegmentsPreviewPill,
	DEFAULT_SEGMENTS,
} from './AudienceSegments';
import { FlagAtom } from './FlagAtom';
import { scheduleIcon } from './FlagIcons';
import { PreviewPillList } from './PreviewPillList';
import { DEFAULT_EDITIONS } from './SelectableEditions';
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
		borderRadius: semanticRadius.cornerSm,
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
	children,
}: {
	keyName: string;
	children: ReactNode;
}) => (
	<div css={styles.parameter}>
		<Typography variant="bodyBoldMd">{keyName}:</Typography>
		{children}
	</div>
);

const DeliveryDisplay = ({
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
	);
};

export const DispatchReport = () => {
	const { updateNotification, notification } = useContext(
		NotificationFormContext,
	);
	const { sendingResult, parameters } = notification;

	if (!sendingResult?.ok) {
		return null;
	}

	const notificationDescription = capitalise(
		getChannelDescription(parameters?.type),
	);

	return (
		<section css={styles.container}>
			<div
				css={{
					gap: semanticSpacing.stackXxs,
					display: 'flex',
					flexDirection: 'column',
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

				{parameters?.type === 'email' && (
					<section>
						<ParameterDisplay keyName="Channel">
							<SendInfoPreviewPill channel="email" isConfirmation={true} />
						</ParameterDisplay>
						<ParameterDisplay keyName="Audience segments">
							<AudienceSegmentsPreviewPill
								segments={DEFAULT_SEGMENTS}
								selected={parameters.audienceSegments ?? []}
								isConfirmation={true}
							/>
						</ParameterDisplay>
						<ParameterDisplay keyName="Delivery and time">
							<DeliveryDisplay
								deliveryTiming={parameters.emailDeliveryOption ?? 'immediate'}
							/>
						</ParameterDisplay>
					</section>
				)}

				{parameters?.type === 'push' && (
					<section>
						<ParameterDisplay keyName="Channel">
							<SendInfoPreviewPill channel="push" isConfirmation={true} />
						</ParameterDisplay>
						<ParameterDisplay keyName="Editions">
							<PreviewPillList
								title="Editions"
								options={DEFAULT_EDITIONS.map(({ code, label }) => ({
									id: code,
									label,
								}))}
								selected={parameters.editions ?? []}
								isConfirmation={true}
								renderIcon={(code) => <FlagAtom segmentCode={code} />}
							/>
						</ParameterDisplay>
						<ParameterDisplay keyName="Delivery and time">
							<DeliveryDisplay
								deliveryTiming={parameters.pushDeliveryOption ?? 'appImmediate'}
							/>
						</ParameterDisplay>
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
				{parameters?.type === 'email' && (
					<Button
						variant="primary"
						onClick={() =>
							updateNotification({ type: 'reset-newsletter-email' })
						}
					>
						Create new newsletter email
					</Button>
				)}
				{parameters?.type === 'push' && (
					<Button
						variant="primary"
						onClick={() => updateNotification({ type: 'reset-app-alert' })}
					>
						Create new app alert
					</Button>
				)}
			</div>
		</section>
	);
};

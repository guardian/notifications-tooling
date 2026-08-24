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
import type {
	AudienceSegment,
	ChannelOption,
	DeliveryOption,
	Edition,
	EmailNotification,
	PushNotification,
} from '../types';
import { scheduleIcon } from './FlagIcons';
import { DEFAULT_EDITIONS, DEFAULT_SEGMENTS } from './segment-options';
import { SegmentPreviewPill } from './SegmentPreviewPill';
import type { SelectableOption } from './SelectablePillGrid';
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

const buildDetails = <Code extends AudienceSegment | Edition>({
	channel,
	segmentLabel,
	options,
	selected,
	deliveryTiming,
}: {
	channel: ChannelOption;
	segmentLabel: string;
	options: Array<SelectableOption<Code>>;
	selected: Code[];
	deliveryTiming: DeliveryOption;
}): Array<{ label: string; node: ReactNode }> => [
	{
		label: 'Channel',
		node: <SendInfoPreviewPill channel={channel} isConfirmation={true} />,
	},
	{
		label: segmentLabel,
		node: (
			<SegmentPreviewPill
				title={segmentLabel}
				options={options}
				selected={selected}
				isConfirmation={true}
			/>
		),
	},
	{
		label: 'Delivery and time',
		node: <DeliveryDisplay deliveryTiming={deliveryTiming} />,
	},
];

type ChannelReport = {
	details: Array<{ label: string; node: ReactNode }>;
	reset: {
		action: 'reset-newsletter-email' | 'reset-app-alert';
		label: string;
	};
};

const getChannelReport = (
	parameters: EmailNotification | PushNotification,
): ChannelReport => {
	switch (parameters.type) {
		case 'email':
			return {
				details: buildDetails({
					channel: 'email',
					segmentLabel: 'Audience segments',
					options: DEFAULT_SEGMENTS,
					selected: parameters.audienceSegments ?? [],
					deliveryTiming: parameters.emailDeliveryOption ?? 'immediate',
				}),
				reset: {
					action: 'reset-newsletter-email',
					label: 'Create new newsletter email',
				},
			};
		case 'push':
			return {
				details: buildDetails({
					channel: 'push',
					segmentLabel: 'Editions',
					options: DEFAULT_EDITIONS,
					selected: parameters.editions ?? [],
					deliveryTiming: parameters.pushDeliveryOption ?? 'appImmediate',
				}),
				reset: {
					action: 'reset-app-alert',
					label: 'Create new app alert',
				},
			};
	}
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

	const report = parameters ? getChannelReport(parameters) : undefined;
	const details = report?.details ?? [];
	const reset = report?.reset;

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

				<section>
					{details.map(({ label, node }) => (
						<ParameterDisplay key={label} keyName={label}>
							{node}
						</ParameterDisplay>
					))}
				</section>
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
				{reset && (
					<Button
						variant="primary"
						onClick={() => updateNotification({ type: reset.action })}
					>
						{reset.label}
					</Button>
				)}
			</div>
		</section>
	);
};

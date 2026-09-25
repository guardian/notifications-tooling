import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Grid, Item } from '@guardian/stand/Grid';
import { Icon } from '@guardian/stand/Icon';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
	articleUrlSearchParam,
	createCopiedNotificationState,
	notificationRoutes,
	withArticleUrl,
} from '../routes';
import { EDITION_OPTIONS } from '../segment/edition-options';
import { FlagPreviewPill } from '../segment/FlagPreviewPill';
import { useNewsletterEmailSegmentOptions } from '../segment/useAudienceEditions';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import { layoutMainTheme } from '../themes';
import type { ChannelOption } from '../types';
import type { DeliveryOption } from '../types';
import { scheduleIcon } from '../ui/flag-icons';
import {
	capitalise,
	getAlternateChannel,
	getAlternateChannelDescription,
	getChannelDescription,
} from '../utils/display-text-helpers';
import { composeNewsletterEmailSubjectLine } from '../utils/newsletter-email-subject';
import type {
	AppAlertFormValues,
	NewsletterEmailFormValues,
} from '../utils/notification-forms';
import {
	defaultAppAlertFormValues,
	defaultNewsletterEmailFormValues,
} from '../utils/notification-forms';
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
	//This is temporary solution to display the delivery time in the report page.
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
	const temporaryDeliveryTime = `${tempTime}, ${tempDate}`;

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
					muted
					showTitle={false}
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

export const NewsletterEmailDispatchDetails = () => {
	const kicker = useWatch<NewsletterEmailFormValues, 'kicker'>({
		name: 'kicker',
		defaultValue: defaultNewsletterEmailFormValues.kicker,
	});
	const subjectText = useWatch<NewsletterEmailFormValues, 'subjectText'>({
		name: 'subjectText',
		defaultValue: '',
	});
	const audienceSegments = useWatch<
		NewsletterEmailFormValues,
		'audienceSegments'
	>({
		name: 'audienceSegments',
		defaultValue: defaultNewsletterEmailFormValues.audienceSegments,
	});
	const deliveryOption = useWatch<NewsletterEmailFormValues, 'deliveryOption'>({
		name: 'deliveryOption',
		defaultValue: defaultNewsletterEmailFormValues.deliveryOption,
	});
	const options = useNewsletterEmailSegmentOptions();

	return (
		<section>
			<ParameterLabel label="Subject">
				<Typography variant="bodySm">
					{composeNewsletterEmailSubjectLine(subjectText, kicker)}
				</Typography>
			</ParameterLabel>
			<ParameterLabel label="Channel">
				<SendInfoPreviewPill channel="newsletter" muted showTitle={false} />
			</ParameterLabel>
			<ParameterLabel label="Audience segments">
				<FlagPreviewPill
					title="Audience segments"
					options={options}
					selected={audienceSegments}
					muted
					showTitle={false}
				/>
			</ParameterLabel>
			<DeliveryParameter deliveryTiming={deliveryOption} />
		</section>
	);
};

export const AppAlertDispatchDetails = () => {
	const topicTypes = useAppAlertTopicTypes();
	const alertType = useWatch<AppAlertFormValues, 'alertType'>({
		name: 'alertType',
		defaultValue: defaultAppAlertFormValues.alertType,
	});
	const headline = useWatch<AppAlertFormValues, 'headline'>({
		name: 'headline',
		defaultValue: '',
	});
	const editions = useWatch<AppAlertFormValues, 'editions'>({
		name: 'editions',
		defaultValue: defaultAppAlertFormValues.editions,
	});
	const deliveryOption = useWatch<AppAlertFormValues, 'deliveryOption'>({
		name: 'deliveryOption',
		defaultValue: defaultAppAlertFormValues.deliveryOption,
	});
	const includeThumbnail = useWatch<AppAlertFormValues, 'includeThumbnail'>({
		name: 'includeThumbnail',
		defaultValue: defaultAppAlertFormValues.includeThumbnail,
	});

	return (
		<section>
			<ParameterLabel label="Headline">
				<Typography variant="bodySm">
					{topicTypes.find(({ id }) => id === alertType)?.label ?? alertType}:{' '}
					{headline}
				</Typography>
			</ParameterLabel>
			<ParameterLabel label="Channel">
				<SendInfoPreviewPill
					channel="app-push"
					includeThumbnail={includeThumbnail}
					muted
					showTitle={false}
				/>
			</ParameterLabel>
			<ParameterLabel label="Editions">
				<FlagPreviewPill
					title="Editions"
					options={EDITION_OPTIONS}
					selected={editions}
					muted
					showTitle={false}
				/>
			</ParameterLabel>
			<DeliveryParameter deliveryTiming={deliveryOption} />
		</section>
	);
};

interface DispatchReportProps {
	channel: ChannelOption;
	children: ReactNode;
	onCreateNew: () => void;
	onCopyToAnotherChannel: () => void;
}

export const DispatchReport = ({
	channel,
	children,
	onCreateNew,
	onCopyToAnotherChannel,
}: DispatchReportProps) => {
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
				<Button variant="primary" onClick={onCreateNew}>
					<Typography
						variant="bodySm"
						css={{
							fontSize: '14px',
							color: semanticColors.text.strongerInverse,
						}}
					>
						Create a new {getChannelDescription(channel)}
					</Typography>
				</Button>
				<Button variant="tertiary" onClick={onCopyToAnotherChannel}>
					<Typography
						variant="bodySm"
						css={{
							fontSize: '14px',
							color: semanticColors.text.strong,
						}}
					>
						Copy to {getAlternateChannelDescription(channel)}
					</Typography>
				</Button>
			</div>
		</section>
	);
};

const DispatchReportTab = ({
	channel,
	notificationId,
	contentTitle,
	children,
}: {
	channel: ChannelOption;
	notificationId?: string;
	contentTitle: string;
	children: ReactNode;
}) => {
	const { reset, setValue } = useFormContext<{ notificationId?: string }>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	if (!notificationId) {
		return <Navigate to={notificationRoutes[channel].create} replace />;
	}

	return (
		<Layout.Main theme={layoutMainTheme}>
			<Grid>
				<Item
					size={12}
					cssOverrides={css({
						paddingTop: semanticSpacing.stackXl,
						paddingLeft: semanticSpacing.stackLg,
						paddingRight: semanticSpacing.stackLg,
					})}
				>
					<DispatchReport
						channel={channel}
						onCreateNew={() => {
							reset();
							setValue('notificationId', undefined);
							void navigate(notificationRoutes[channel].create);
						}}
						onCopyToAnotherChannel={() => {
							void navigate(
								withArticleUrl(
									notificationRoutes[getAlternateChannel(channel)].create,
									searchParams.get(articleUrlSearchParam) ?? '',
								),
								{
									state: createCopiedNotificationState(contentTitle),
								},
							);
						}}
					>
						{children}
					</DispatchReport>
				</Item>
			</Grid>
		</Layout.Main>
	);
};

export const NewsletterEmailDispatchReportTab = () => {
	const notificationId = useWatch<NewsletterEmailFormValues, 'notificationId'>({
		name: 'notificationId',
	});
	const subjectText = useWatch<NewsletterEmailFormValues, 'subjectText'>({
		name: 'subjectText',
		defaultValue: defaultNewsletterEmailFormValues.subjectText,
	});
	return (
		<DispatchReportTab
			channel="newsletter"
			notificationId={notificationId}
			contentTitle={subjectText}
		>
			<NewsletterEmailDispatchDetails />
		</DispatchReportTab>
	);
};

export const AppAlertDispatchReportTab = () => {
	const notificationId = useWatch<AppAlertFormValues, 'notificationId'>({
		name: 'notificationId',
	});
	const headline = useWatch<AppAlertFormValues, 'headline'>({
		name: 'headline',
		defaultValue: defaultAppAlertFormValues.headline,
	});
	return (
		<DispatchReportTab
			channel="app-push"
			notificationId={notificationId}
			contentTitle={headline}
		>
			<AppAlertDispatchDetails />
		</DispatchReportTab>
	);
};

import { css } from '@emotion/react';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
import type { AlertBannerProps } from '@guardian/stand/AlertBanner';
import type { ButtonTheme } from '@guardian/stand/Button';
import type { FaviconTheme } from '@guardian/stand/Favicon';
import type { LayoutMainProps } from '@guardian/stand/Layout';
import type { TopBarTheme } from '@guardian/stand/TopBar';
import { from, until } from '@guardian/stand/utils';

export const topBarHeight = '4rem';

export const layer = {
	stickyContent: 1,
	topBar: 2,
} as const;

export const topBarTheme: TopBarTheme = {
	backgroundColor: baseColors.magenta[200],
	height: topBarHeight,
	borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
	borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
	borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
	borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,

	collapsedNavMenu: {
		button: {
			color: semanticColors.text.strongerInverse,
			active: { backgroundColor: baseColors.magenta[100] },
			hovered: { backgroundColor: baseColors.magenta[100] },
		},
		popover: {
			backgroundColor: baseColors.magenta[200],
		},
	},
	toolName: {
		color: semanticColors.text.strongerInverse,
		hoverLink: {
			color: semanticColors.text.strongerInverse,
			backgroundColor: 'transparent',
			pressed: {
				backgroundColor: 'transparent',
			},
		},
	},
	navigation: {
		shared: {
			_menuOpen: {
				selected: {
					backgroundColor: baseColors.magenta[100],
				},
			},
		},
		selected: {
			color: semanticColors.text.strongerInverse,
			borderBottom: `${semanticSizing.border.extraWide} solid ${baseColors.magenta[700]}`,
		},
		unselected: {
			color: semanticColors.text.strongerInverse,
		},
	},
};

export const faviconTheme: FaviconTheme = {
	color: {
		background: baseColors.magenta[400],
	},
};

export const layoutMainTheme: LayoutMainProps['theme'] = {
	sm: { padding: { top: '0px', bottom: '0px' } },
	md: { padding: { top: '0px', bottom: '0px' } },
	lg: { padding: { top: '0px', bottom: '0px' } },
};

export const selectableTileTheme = {
	selectableTile: (isChecked: boolean) =>
		css({
			padding: 0,
			borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			width: '450px',
			minHeight: '74px',
			display: 'flex',
			gap: semanticSpacing.stackXxs,
			flexDirection: 'column',
			backgroundColor: isChecked
				? baseColors.magenta['900']
				: baseColors.neutral['900'],
		}),
	iconRow: css({
		display: 'flex',
		flexDirection: 'row',
		padding: '8px 8px 8px 12px',
		gap: semanticSpacing.stackXs,
		alignItems: 'center',
	}),
	emailIcon: css({
		width: '20px',
		height: '20px',
		gap: '10px',
	}),
	titleStyle: css({
		gap: '10px',
	}),
	deliveryIcon: css({
		backgroundColor: baseColors.magenta[900],
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		gap: `${baseSpacing['8Px']}`,
		height: '32px',
	}),
};

export const activePillTheme = {
	activePill: css({
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weaker}`,
		backgroundColor: semanticColors.bg.base,
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		height: '36px',
		display: 'flex',
		flexDirection: 'row',
		gap: semanticSpacing.stackXs,
		alignItems: 'center',
		justifyContent: 'center',
	}),
	activePillIcon: css({
		height: '20px',
		width: '20px',
		gap: '10px',
	}),
	isConfirmationStyle: css({
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weaker}`,
		borderRadius: semanticRadius.cornerXs,
		height: semanticSizing.height.sm,
		fontSize: '14px',
		display: 'flex',
		flexDirection: 'row',
		gap: semanticSpacing.stackXs,
		alignItems: 'center',
		justifyContent: 'center',
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
	}),
};

export const articlePreviewCardTheme = {
	card: (isLiveblog: boolean) =>
		css({
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'flex-start',
			justifyContent: 'space-between',
			gap: semanticSpacing.stackMd,
			padding: semanticSpacing.stackSm,
			borderRadius: semanticRadius.cornerSm,
			backgroundColor: baseColors.neutral[850],
			maxWidth: isLiveblog ? '900px' : '500px',
			'@media (max-width: 600px)': isLiveblog
				? { flexDirection: 'column', alignItems: 'stretch' }
				: undefined,
		}),
	details: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
		minWidth: 0,
		flex: 1,
	}),
	liveStatus: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
	}),
	liveIndicator: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXxs,
		padding: `${baseSpacing['2Px']} ${baseSpacing['6Px']}`,
		color: semanticColors.text.strongerInverse,
		backgroundColor: semanticColors.text.error,
		textTransform: 'uppercase',
	}),
	liveIndicatorDot: css({
		width: '8px',
		height: '8px',
		borderRadius: '50%',
		backgroundColor: semanticColors.text.strongerInverse,
	}),
	liveblogBlockId: css({
		fontSize: '12px',
		fontWeight: 700,
		color: semanticColors.text.success,
		margin: 0,
	}),
	sectionLabel: (color: string) =>
		css({
			fontSize: '12px',
			color,
		}),
	headline: css({
		fontSize: '12px',
		color: semanticColors.text.strong,
	}),
	published: css({
		fontSize: '12px',
		color: semanticColors.text.weak,
		margin: 0,
	}),
	updated: css({
		fontSize: '12px',
		color: semanticColors.text.strong,
	}),
	publishedRelative: css({
		fontWeight: 700,
		color: semanticColors.text.strong,
	}),
	url: css({
		fontSize: '12px',
		color: semanticColors.text.link,
		overflowWrap: 'anywhere',
	}),
	thumbnail: (isLiveblog: boolean) =>
		css({
			width: '124px',
			aspectRatio: isLiveblog ? '5 / 4' : undefined,
			borderRadius: semanticRadius.cornerXs,
			objectFit: 'cover',
			flexShrink: 0,
		}),
};

export const audienceSegmentStyles = {
	audienceSegmentCheckBoxTile: (isSelected: boolean) =>
		css({
			backgroundColor: isSelected
				? baseColors.magenta[900]
				: semanticColors.fill.weak,
			color: semanticColors.text.strong,
			'&:hover': {
				backgroundColor: isSelected
					? baseColors.magenta[900]
					: semanticColors.fill.weakPressed,
			},
			border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
			padding: `${baseSpacing['6Px']} ${baseSpacing['6Px']}`,
			borderRadius: semanticRadius.cornerSm,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: `${baseSpacing['8Px']}`,
			height: '56px',
			width: '100%',
		}),
};

export const previewPillStyles = {
	pill: css({
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		backgroundColor: semanticColors.fill.weak,
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		display: 'flex',
		alignItems: 'center',
		gap: `${baseSpacing['8Px']}`,
		height: '32px',
	}),
	icon: css({
		border: `${semanticSizing.border.default} transparent  ${semanticColors.border.weak}`,
		width: '24px',
		height: '18px',
		gap: `${baseSpacing['10Px']}`,
	}),
	confirmationPill: css({
		backgroundColor: semanticColors.fill.weak,
		color: semanticColors.text.weak,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weaker}`,
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		display: 'flex',
		alignItems: 'center',
		gap: `${baseSpacing['8Px']}`,
		height: '32px',
	}),
};

export const ToggleSwitchTheme = {
	baseStyle: (selected: boolean) =>
		css({
			display: 'flex',
			alignItems: 'center',
			width: '44px',
			height: '24px',
			borderRadius: '100px',
			padding: '3px',
			gap: '10px',
			backgroundColor: selected
				? baseColors.magenta[200]
				: semanticColors.bg.raisedLevel3Inverse,
			border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		}),
	thumb: (selected: boolean) =>
		css({
			width: '18px',
			height: '18px',
			paddingLeft: selected ? '16px' : '0px',
			alignItems: 'center',
			color: semanticColors.bg.base,
		}),
};

export const alertBannerCss = css({
	border: `${semanticSizing.border.default} solid ${semanticColors.border.information}`,
	height: 'auto',
	backgroundColor: semanticColors.fill.weak,
	paddingBlock: '12px',
	paddingTop: '12px',
	paddingRight: '16px',
	paddingBottom: '12px',
	paddingLeft: '8px',
});

export const customAlertBannerTheme: NonNullable<AlertBannerProps['theme']> = {
	shared: {
		content: {
			icon: {
				color: semanticColors.text.blue,
			},
		},
	},
};
export const replaceThumbnailButtonTheme: ButtonTheme = {
	tertiary: {
		shared: {
			border: 'none',
			backgroundColor: semanticColors.bg.base,
			color: semanticColors.text.weak,
			hover: {
				border: 'none',
				backgroundColor: semanticColors.bg.base,
			},
			active: {
				border: 'none',
				backgroundColor: semanticColors.bg.base,
			},
		},
	},
};

export const dispatchLandingTheme = {
	dispatchMainContainer: css({
		flow: 'vertical',
		paddingTop: semanticSpacing.stackLg,
		paddingInline: semanticSpacing.stackMd,
		width: '100%',
		maxWidth: '983px',
		gap: semanticSpacing.stackLg,
		[from.md]: {
			paddingInline: semanticSpacing.stackLg,
		},
	}),
	dispatchTableSection: css({
		width: '100%',
		maxWidth: '983px',
		marginTop: '16px',
		borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		paddingTop: '12px',
		gap: semanticSpacing.stackMd,
	}),
	activityHeading: css({
		marginBottom: semanticSpacing.stackSm,
	}),
	activityControls: css({
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: semanticSpacing.stackSm,
		marginBottom: semanticSpacing.stackMd,
	}),
	activityCounters: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
	}),
};

export const historyViewStyles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackMd,
		padding: semanticSpacing.stackLg,
	}),
	header: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackLg,
		[from.md]: {
			flexDirection: 'row',
			alignItems: 'center',
		},
	}),
	headerActions: css({
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: semanticSpacing.stackSm,
		minWidth: 0,
		[from.md]: {
			marginLeft: 'auto',
		},
	}),
	refreshControls: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		whiteSpace: 'nowrap',
	}),
	titleBlock: css({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	}),
	notification: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackSm,
		minWidth: 0,
	}),
	thumbnail: css({
		width: '60px',
		height: '60px',
		flexShrink: 0,
		objectFit: 'cover',
	}),
	thumbnailFallback: css({
		display: 'flex',
		width: '60px',
		height: '60px',
		flexShrink: 0,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: semanticSpacing.stackXxs,
		textAlign: 'center',
		color: semanticColors.text.weak,
		backgroundColor: semanticColors.fill.neutralWeak,
	}),
	notificationDetails: css({
		display: 'flex',
		minWidth: 0,
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
	}),
	title: css({
		display: '-webkit-box',
		overflow: 'hidden',
		WebkitBoxOrient: 'vertical',
		WebkitLineClamp: 2,
	}),
	channel: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		color: semanticColors.text.weak,
	}),
	notificationType: css({
		display: 'none',
		'@media (min-width: 600px)': {
			display: 'inline',
		},
	}),
	regions: css({
		display: 'inline-flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		'& svg': {
			display: 'block',
			width: '24px',
			height: '18px',
		},
	}),
	table: css({
		'@media (min-width: 600px) and (max-width: 1055.9px)': {
			'& [role="row"]': {
				gridTemplateColumns: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
			},
		},
	}),
	tableHeader: css({
		'& > tr > *': {
			padding: '16px',
		},
		'& > tr > :not(:first-of-type)': {
			display: 'none',
			[from.lg]: {
				display: 'block',
			},
		},
	}),
	tableRow: css({
		rowGap: semanticSpacing.stackXs,
		paddingBlock: semanticSpacing.stackXs,
		[from.lg]: {
			rowGap: 0,
			paddingBlock: 0,
		},
	}),
	notificationCell: css({
		'@media (min-width: 600px) and (max-width: 1055.9px)': {
			alignSelf: 'start',
		},
		'@media (min-width: 600px) and (max-width: 829.9px)': {
			gridColumn: '1',
			gridRow: '1 / span 4',
		},
	}),
	metadataCell: (row: number) =>
		css({
			paddingBlock: 0,
			[until.lg]: {
				display: 'grid',
				gridTemplateColumns: '80px minmax(0, 1fr)',
				alignItems: 'center',
			},
			'@media (min-width: 600px) and (max-width: 829.9px)': {
				gridColumn: '2',
				gridRow: String(row),
			},
		}),
	compactLabel: css({
		color: semanticColors.text.weak,
		[until.lg]: {
			display: 'inline',
		},
		[from.lg]: {
			display: 'none',
		},
	}),
	metadataValue: css({
		minWidth: 0,
	}),
	sendTimeValue: css({
		display: 'inline-flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXxs,
	}),
	statusBadge: css({
		boxSizing: 'border-box',
		height: '18px',
		paddingBlock: 0,
		paddingInline: '6px',
		whiteSpace: 'nowrap',
		[from.lg]: {
			height: '24px',
			paddingInline: '8px',
			font: semanticTypography.headingSm.font,
			letterSpacing: semanticTypography.headingSm.letterSpacing,
		},
	}),
	empty: css({
		margin: 0,
		padding: `${semanticSpacing.stackLg} 0`,
		color: semanticColors.text.weak,
	}),
};

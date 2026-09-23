import { css, keyframes } from '@emotion/react';
import {
	baseColors,
	baseSizing,
	baseSpacing,
	baseTypography,
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
import type { ToggleSwitchTheme } from '@guardian/stand/ToggleSwitch';
import type { TopBarTheme } from '@guardian/stand/TopBar';
import { from, until } from '@guardian/stand/utils';

export const topBarHeight = '4rem';
export const stickyHeaderHeightProperty = '--sticky-header-height';
export const stickyHeaderHeight = `var(${stickyHeaderHeightProperty}, ${topBarHeight})`;

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
	outlinedPill: css({
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
			fontSize: '14px',
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
	mutedPill: css({
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

export const toggleSwitchTheme: ToggleSwitchTheme = {
	shared: {
		track: {
			selected: {
				backgroundColor: baseColors.magenta[200],
			},
		},
		thumb: {
			color: baseColors.magenta[200],
		},
	},
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
	global: css({
		[from.lg]: {
			'html, body': {
				overflow: 'hidden',
			},
		},
	}),
	layout: css({
		gridTemplateAreas: "'alertbanner' 'topbar' 'main' 'latest'",
		gridTemplateColumns: 'minmax(0, 1fr)',
		gridTemplateRows: 'min-content min-content auto auto',
		[from.md]: {
			gridTemplateAreas: "'alertbanner' 'topbar' 'main' 'latest'",
			gridTemplateColumns: 'minmax(0, 1fr)',
			gridTemplateRows: 'min-content min-content auto auto',
		},
		[from.lg]: {
			gridTemplateAreas:
				"'alertbanner alertbanner alertbanner' 'topbar topbar topbar' 'main gap latest'",
			gridTemplateColumns: 'minmax(0, 983px) minmax(0, 1fr) minmax(0, 676px)',
			gridTemplateRows: 'min-content min-content minmax(0, 1fr)',
			height: '100svh',
			overflow: 'hidden',
		},
	}),
	primaryColumn: css({
		gridArea: 'main',
		minWidth: 0,
		padding: baseSpacing['24Px'],
		[from.sm]: {
			paddingBottom: baseSpacing['24Px'],
		},
		[from.md]: {
			paddingBottom: baseSpacing['24Px'],
		},
		[from.lg]: {
			display: 'flex',
			minHeight: 0,
			flexDirection: 'column',
			paddingBottom: baseSpacing['24Px'],
			overflow: 'hidden',
		},
	}),
	latestContentRail: css({
		gridArea: 'latest',
		minWidth: 0,
		paddingTop: 0,
		paddingBottom: '39px',
		paddingInline: baseSpacing['24Px'],
		backgroundColor: semanticColors.bg.base,
		'&::before': {
			display: 'block',
			marginBottom: semanticSpacing.stackSm,
			borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
			content: '""',
		},
		[from.lg]: {
			display: 'flex',
			minHeight: 0,
			paddingTop: '39px',
			paddingInline: semanticSpacing.stackLg,
			backgroundColor: semanticColors.bg.raisedLevel1,
			overflow: 'hidden',
			'&::before': {
				display: 'none',
			},
			'& [data-latest-content-table-header]': {
				display: 'none',
			},
			'& [data-latest-content-table-body] > [role="row"]:nth-of-type(n + 4)': {
				display: 'grid',
			},
		},
	}),
	dispatchTableSection: css({
		width: '100%',
		marginTop: semanticSpacing.stackMd,
		borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		paddingTop: semanticSpacing.stackSm,
		gap: semanticSpacing.stackMd,
		[from.lg]: {
			display: 'flex',
			minHeight: 0,
			flex: 1,
			flexDirection: 'column',
			overflow: 'hidden',
		},
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

const compactLatestContentQuery =
	'@container latest-content-table (max-width: 580px)';
const expandedLatestContentQuery =
	'@container latest-content-table (min-width: 580px)';

export const latestPublishedContentTheme = {
	panel: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackMd,
		width: '100%',
		[from.lg]: {
			minHeight: 0,
			flex: 1,
			overflow: 'hidden',
		},
	}),
	header: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXs,
	}),
	titleRow: css({
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: semanticSpacing.stackSm,
		minWidth: 0,
	}),
	refreshControls: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		whiteSpace: 'nowrap',
		marginLeft: 'auto',
	}),
	helpText: css({
		color: semanticColors.text.weak,
	}),
	loading: css({
		display: 'grid',
		minHeight: '280px',
		placeItems: 'center',
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		color: semanticColors.text.weak,
	}),
	list: css({
		width: '100%',
		containerType: 'inline-size',
		containerName: 'latest-content-table',
		backgroundColor: semanticColors.bg.raisedLevel1,
		[from.lg]: {
			backgroundColor: 'transparent',
		},
	}),
	tableBody: (showAll: boolean) =>
		css({
			'& > [role="row"]': {
				backgroundColor: semanticColors.bg.raisedLevel1,
			},
			...(!showAll && {
				'& > [role="row"]:nth-of-type(n + 4)': {
					display: 'none',
				},
			}),
			[from.lg]: {
				'& > [role="row"]': {
					backgroundColor: 'transparent',
				},
			},
		}),
	tableHeader: css({
		backgroundColor: semanticColors.bg.raisedLevel2,
		'& > tr > *': {
			padding: semanticSpacing.stackMd,
		},
	}),
	tableHeaderContent: css({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: semanticSpacing.stackSm,
		'& button': {
			height: 'auto',
			padding: 0,
		},
	}),
	card: css({
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) 104px',
		gap: semanticSpacing.stackSm,
		padding: semanticSpacing.stackMd,
		backgroundColor: 'transparent',
		[expandedLatestContentQuery]: {
			display: 'grid',
			gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.5fr) 80px max-content',
			alignItems: 'center',
			columnGap: semanticSpacing.stackSm,
			rowGap: semanticSpacing.stackXxs,
			paddingBlock: semanticSpacing.stackSm,
		},
		[compactLatestContentQuery]: {
			display: 'grid',
			gridTemplateColumns: 'minmax(0, 1fr) 104px',
			gap: semanticSpacing.stackSm,
			padding: semanticSpacing.stackMd,
		},
	}),
	cardDetails: css({
		display: 'flex',
		minWidth: 0,
		flexDirection: 'column',
		gap: semanticSpacing.stackSm,
		[expandedLatestContentQuery]: {
			display: 'contents',
		},
		[compactLatestContentQuery]: {
			display: 'flex',
		},
	}),
	cardActions: css({
		display: 'flex',
		width: '104px',
		flexDirection: 'column',
		gap: semanticSpacing.stackSm,
		[expandedLatestContentQuery]: {
			display: 'contents',
		},
		[compactLatestContentQuery]: {
			display: 'flex',
		},
	}),
	cardMeta: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
		[expandedLatestContentQuery]: {
			minWidth: 0,
		},
	}),
	sectionLabel: (color: string) =>
		css({
			fontSize: baseTypography.size['12Px'],
			color,
		}),
	sectionName: css({
		fontWeight: 700,
	}),
	published: css({
		fontSize: baseTypography.size['12Px'],
		color: semanticColors.text.strong,
	}),
	publishedRelative: css({
		fontWeight: 700,
		color: semanticColors.text.strong,
	}),
	cardHeadline: css({
		display: 'flex',
		alignItems: 'flex-start',
		[expandedLatestContentQuery]: {
			minWidth: 0,
		},
	}),
	headline: css({
		fontSize: baseTypography.size['14Px'],
		lineHeight: 1.4,
		color: semanticColors.text.strong,
		[expandedLatestContentQuery]: {
			display: '-webkit-box',
			overflow: 'hidden',
			WebkitBoxOrient: 'vertical',
			WebkitLineClamp: 2,
		},
		[compactLatestContentQuery]: {
			display: 'block',
			overflow: 'visible',
			WebkitLineClamp: 'unset',
		},
	}),
	thumbnail: css({
		width: '100%',
		maxWidth: '124px',
		aspectRatio: '5 / 4',
		objectFit: 'cover',
		borderRadius: semanticRadius.cornerXs,
		[expandedLatestContentQuery]: {
			width: baseSpacing['80Px'],
			height: baseSpacing['64Px'],
			maxWidth: 'none',
			aspectRatio: 'auto',
		},
		[compactLatestContentQuery]: {
			width: '104px',
			height: 'auto',
			maxWidth: 'none',
			aspectRatio: '5 / 4',
		},
	}),
	thumbnailFallback: css({
		display: 'flex',
		width: '100%',
		maxWidth: '124px',
		aspectRatio: '5 / 4',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: semanticSpacing.stackXxs,
		color: semanticColors.text.weak,
		backgroundColor: semanticColors.fill.neutralWeak,
		borderRadius: semanticRadius.cornerXs,
		[expandedLatestContentQuery]: {
			width: baseSpacing['80Px'],
			height: baseSpacing['64Px'],
			maxWidth: 'none',
			aspectRatio: 'auto',
		},
		[compactLatestContentQuery]: {
			width: '104px',
			height: 'auto',
			maxWidth: 'none',
			aspectRatio: '5 / 4',
		},
	}),
	createButtonSlot: css({
		display: 'flex',
		alignItems: 'center',
		[expandedLatestContentQuery]: {
			alignSelf: 'stretch',
			paddingLeft: semanticSpacing.stackSm,
			borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		},
		[compactLatestContentQuery]: {
			alignSelf: 'auto',
			paddingLeft: 0,
			borderLeft: 0,
		},
	}),
	createButton: css({
		alignSelf: 'flex-start',
		flexShrink: 0,
		whiteSpace: 'nowrap',
		background: semanticColors.bg.base,
		'&[data-hovered], &:hover': {
			background: semanticColors.bg.raisedLevel1,
		},
		[expandedLatestContentQuery]: {
			alignSelf: 'center',
		},
		[compactLatestContentQuery]: {
			alignSelf: 'flex-start',
			width: '104px',
		},
	}),
} as const;

const skeletonPulse = keyframes({
	'0%, 100%': { opacity: 0.45 },
	'50%': { opacity: 1 },
});

const skeletonBase = {
	display: 'block',
	backgroundColor: semanticColors.fill.neutralWeak,
	animation: `${skeletonPulse} 1.5s ease-in-out infinite`,
	'@media (prefers-reduced-motion: reduce)': {
		animation: 'none',
	},
} as const;

export const emptyStateStyles = {
	empty: css({
		display: 'flex',
		minHeight: '280px',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: semanticSpacing.stackXs,
		padding: semanticSpacing.stackLg,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		textAlign: 'center',
	}),
	emptyIcon: css({
		display: 'grid',
		width: '48px',
		height: '48px',
		placeItems: 'center',
		marginBottom: semanticSpacing.stackXs,
		borderRadius: '50%',
		color: semanticColors.text.weak,
		backgroundColor: semanticColors.fill.neutralWeak,
	}),
	emptyCopy: css({
		maxWidth: '420px',
		color: semanticColors.text.weak,
	}),
} as const;

export const historyViewStyles = {
	page: css({
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr)',
		[from.md]: {
			gridTemplateColumns: '18rem minmax(0, 1fr)',
		},
	}),
	filters: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackSm,
		padding: semanticSpacing.stackSm,
		borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		backgroundColor: semanticColors.fill.neutralWeak,
		[from.md]: {
			minHeight: `calc(100vh - ${stickyHeaderHeight})`,
			borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
			borderBottom: 0,
		},
	}),
	clearFilters: css({
		alignSelf: 'flex-end',
		height: 'auto',
		padding: 0,
		border: 0,
		color: semanticColors.text.link,
		background: 'transparent',
		textDecoration: 'underline',
		font: 'inherit',
		'&[data-hovered], &:hover, &[data-pressed], &:active': {
			border: 0,
			color: semanticColors.text.link,
			background: 'transparent',
		},
		'&:focus-visible': {
			outline: `${semanticSizing.border.md} solid ${semanticColors.border.focused}`,
			outlineOffset: semanticSizing.border.md,
		},
	}),
	clearFiltersHidden: css({
		visibility: 'hidden',
	}),
	searchField: css({
		position: 'relative',
	}),
	filterFields: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackLg,
	}),
	searchIcon: css({
		position: 'absolute',
		left: semanticSpacing.stackSm,
		bottom: `calc((${semanticSizing.height.md} - ${semanticSizing.icon.md}) / 2)`,
		pointerEvents: 'none',
	}),
	audienceField: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
	}),
	audienceTrigger: css({
		display: 'flex',
		width: '100%',
		height: semanticSizing.height.md,
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingInline: semanticSpacing.stackSm,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderRadius: semanticRadius.cornerSm,
		backgroundColor: semanticColors.bg.base,
		color: semanticColors.text.strong,
		cursor: 'pointer',
		font: 'inherit',
		'&[data-focus-visible]': {
			outline: `${semanticSizing.border.md} solid ${semanticColors.border.focused}`,
			outlineOffset: semanticSizing.border.md,
		},
		'&[data-hovered], &:hover, &[data-pressed], &[aria-expanded="true"]': {
			backgroundColor: semanticColors.bg.base,
			color: semanticColors.text.strong,
			border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		},
		'&[aria-expanded="true"] svg': {
			transform: 'rotate(180deg)',
		},
		'& svg': {
			flexShrink: 0,
		},
	}),
	audienceTriggerValue: css({
		overflow: 'hidden',
		minWidth: 0,
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	}),
	audiencePopover: css({
		width: 'var(--trigger-width)',
		maxWidth: 'var(--trigger-width)',
	}),
	senderPopover: css({
		width: 'var(--trigger-width)',
		maxWidth: 'var(--trigger-width)',
		overflowX: 'hidden',
	}),
	audienceMenuItem: css({
		gridTemplateColumns: 'minmax(0, 1fr)',
		gridTemplateAreas: '"label"',
		overflow: 'hidden',
		'& > .material-symbols': {
			display: 'none',
		},
	}),
	filterCheckbox: css({
		width: '100%',
		pointerEvents: 'none',
		cursor: 'inherit',
	}),
	senderCheckbox: css({
		width: '100%',
		overflow: 'hidden',
		minWidth: 0,
		pointerEvents: 'none',
		cursor: 'inherit',
		'& > *': {
			overflow: 'hidden',
			minWidth: 0,
		},
	}),
	senderOptionValue: css({
		display: 'block',
		overflow: 'hidden',
		minWidth: 0,
		maxWidth: '100%',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	}),
	visualOnly: css({
		display: 'contents',
	}),
	categoryFilter: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXs,
		minWidth: 0,
	}),
	categoryButton: css({
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) auto',
		alignItems: 'center',
		width: '100%',
		height: '40px',
		paddingLeft: semanticSpacing.stackSm,
		paddingRight: semanticSpacing.stackXs,
		textAlign: 'left',
		font: semanticTypography.labelFormInlineMd.font,
		letterSpacing: semanticTypography.labelFormInlineMd.letterSpacing,
		fontVariationSettings: `"wdth" ${semanticTypography.labelFormInlineMd.fontWidth}`,
		color: semanticColors.text.strong,
		backgroundColor: semanticColors.bg.base,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.stronger}`,
		borderRadius: semanticRadius.cornerSm,
		'&[data-hovered]': {
			backgroundColor: semanticColors.fill.weakHover,
			color: semanticColors.text.strong,
		},
		'&[data-pressed]': {
			backgroundColor: semanticColors.fill.weakHover,
			color: semanticColors.text.strong,
		},
		'&[aria-expanded="true"] .material-symbols': {
			transform: 'rotate(180deg)',
		},
	}),
	categorySummary: css({
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	}),
	categoryPopover: css({
		width: 'var(--trigger-width)',
	}),
	categoryMenuItem: css({
		gridTemplateColumns: 'minmax(0, 1fr)',
		gridTemplateAreas: '"label"',
		borderBottom: 'none',
		'& > .material-symbols': {
			display: 'none',
		},
	}),
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
		borderRadius: semanticRadius.cornerSm,
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
		flexWrap: 'wrap',
		'& svg': {
			display: 'block',
			width: '24px',
			height: '18px',
		},
	}),
	table: css({
		containerType: 'inline-size',
		containerName: 'history-table',
		'@media (min-width: 600px) and (max-width: 1055.9px)': {
			'& [role="row"]': {
				gridTemplateColumns: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
			},
		},
		'@container history-table (max-width: 899.9px)': {
			'& [role="row"]': {
				gridTemplateColumns: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
			},
		},
		'@container history-table (max-width: 599.9px)': {
			'& [role="row"]': {
				gridTemplateColumns: 'minmax(0, 1fr)',
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
			'@container history-table (max-width: 899.9px)': {
				display: 'none',
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
		'@container history-table (max-width: 899.9px)': {
			rowGap: semanticSpacing.stackXs,
			paddingBlock: semanticSpacing.stackXs,
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
		'@container history-table (max-width: 899.9px)': {
			gridColumn: '1',
			gridRow: '1 / span 4',
			alignSelf: 'start',
		},
		'@container history-table (max-width: 599.9px)': {
			gridRow: 'auto',
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
			'@container history-table (max-width: 899.9px)': {
				display: 'grid',
				gridTemplateColumns: '80px minmax(0, 1fr)',
				alignItems: 'center',
				gridColumn: '2',
				gridRow: String(row),
			},
			'@container history-table (max-width: 599.9px)': {
				gridColumn: '1',
				gridRow: 'auto',
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
		'@container history-table (max-width: 899.9px)': {
			display: 'inline',
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
		'@container history-table (max-width: 899.9px)': {
			height: baseSizing.size18Px,
			paddingInline: baseSpacing['6Px'],
			font: 'inherit',
		},
	}),
	skeletonThumbnail: css({
		...skeletonBase,
		width: '60px',
		height: '60px',
		flexShrink: 0,
	}),
	skeletonNotificationDetails: css({
		display: 'flex',
		width: 'min(100%, 320px)',
		flexDirection: 'column',
		gap: semanticSpacing.stackXs,
	}),
	skeletonLine: (width: string) =>
		css({
			...skeletonBase,
			width,
			height: '14px',
		}),
	skeletonMetadata: css({
		...skeletonBase,
		width: '70%',
		height: '14px',
	}),
};

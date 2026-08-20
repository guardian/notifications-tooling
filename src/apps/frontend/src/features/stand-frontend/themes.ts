import { css } from '@emotion/react';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import type { FaviconTheme } from '@guardian/stand/Favicon';
import type { LayoutMainProps } from '@guardian/stand/Layout';
import type { TopBarTheme } from '@guardian/stand/TopBar';

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
	card: css({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: semanticSpacing.stackMd,
		padding: semanticSpacing.stackSm,
		borderRadius: semanticRadius.cornerSm,
		backgroundColor: baseColors.neutral[850],
		maxWidth: '500px',
	}),
	details: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
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
	publishedRelative: css({
		fontWeight: 700,
		color: semanticColors.text.strong,
	}),
	url: css({
		fontSize: '12px',
		color: semanticColors.text.link,
		overflowWrap: 'anywhere',
	}),
	thumbnail: css({
		width: '120px',
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

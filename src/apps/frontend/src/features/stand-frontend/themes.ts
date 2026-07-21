import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import type { FaviconTheme } from '@guardian/stand/Favicon';
import { LayoutMainProps } from '@guardian/stand/Layout';
import type { TopBarTheme } from '@guardian/stand/TopBar';

export const topBarTheme: TopBarTheme = {
	backgroundColor: baseColors.magenta[200],
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


import {
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticTypography,
} from '@guardian/stand';
import { Button, type ButtonTheme } from '@guardian/stand/Button';

const refreshButtonTheme: ButtonTheme = {
	secondary: {
		shared: {
			color: semanticColors.text.strong,
			backgroundColor: semanticColors.bg.base,
			borderRadius: semanticRadius.cornerMd,
			border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			hover: {
				backgroundColor: semanticColors.fill.weak,
				border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			},
			active: {
				backgroundColor: semanticColors.fill.weakPressed,
				border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			},
		},
		sm: {
			typography: {
				font: semanticTypography.bodySm.font,
				letterSpacing: semanticTypography.bodySm.letterSpacing,
			},
		},
	},
};

interface RefreshButtonProps {
	onRefresh: () => void;
	isRefreshing?: boolean;
}

export const RefreshButton = ({
	onRefresh,
	isRefreshing = false,
}: RefreshButtonProps) => (
	<Button
		type="button"
		icon="refresh"
		size="sm"
		variant="secondary"
		theme={refreshButtonTheme}
		isDisabled={isRefreshing}
		onClick={onRefresh}
	>
		Refresh activity
	</Button>
);

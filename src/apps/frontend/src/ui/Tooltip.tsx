import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import { componentTooltip } from '@guardian/stand';
import type { IconProps } from '@guardian/stand/Icon';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { TooltipProps as AriaTooltipProps } from 'react-aria-components';
import {
	Tooltip as AriaTooltip,
	Button,
	OverlayArrow,
	TooltipTrigger,
} from 'react-aria-components';

export interface TooltipTheme {
	color: string;
	backgroundColor: string;
	triggerColor: string;
}

export interface TooltipProps {
	children: ReactNode;
	label: string;
	symbol?: IconProps['symbol'];
	iconSize?: IconProps['size'];
	placement?: AriaTooltipProps['placement'];
	theme?: Partial<TooltipTheme>;
	cssOverrides?: SerializedStyles | SerializedStyles[];
}

const defaultTheme: TooltipTheme = {
	color: componentTooltip.shared.color,
	backgroundColor: componentTooltip.shared.backgroundColor,
	triggerColor: 'inherit',
};

const styles = {
	trigger: (theme: TooltipTheme) =>
		css({
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			appearance: 'none',
			border: 'none',
			padding: 0,
			background: 'none',
			color: theme.triggerColor,
			cursor: 'pointer',
		}),
	tooltip: (theme: TooltipTheme) =>
		css({
			padding: componentTooltip.tooltip.padding,
			maxWidth: componentTooltip.tooltip.maxWidth,
			color: theme.color,
			backgroundColor: theme.backgroundColor,
			borderRadius: componentTooltip.tooltip.borderRadius,
			filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15))',

			"&[data-placement='top']": {
				marginBottom: componentTooltip.tooltip.offset,
				svg: { transform: 'rotate(-90deg) translateX(3px)' },
			},
			"&[data-placement='bottom']": {
				marginTop: componentTooltip.tooltip.offset,
				svg: { transform: 'rotate(90deg) translateX(3px)' },
			},
			"&[data-placement='right']": {
				marginLeft: componentTooltip.tooltip.offset,
			},
			"&[data-placement='left']": {
				marginRight: componentTooltip.tooltip.offset,
				svg: { transform: 'rotate(180deg)' },
			},
		}),
	arrow: (theme: TooltipTheme) =>
		css({
			display: 'block',
			fill: theme.backgroundColor,
		}),
};

const TooltipArrow = ({ theme }: { theme: TooltipTheme }) => (
	<OverlayArrow>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="9"
			height="14"
			viewBox="0 0 9 14"
			css={styles.arrow(theme)}
		>
			<path d="M0 6.928 9 0v13.856z" />
		</svg>
	</OverlayArrow>
);

export const Tooltip = ({
	children,
	label,
	symbol = 'info',
	iconSize = 'sm',
	placement = 'top',
	theme,
	cssOverrides,
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const mergedTheme = { ...defaultTheme, ...theme };

	return (
		<TooltipTrigger
			delay={0}
			closeDelay={0}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
		>
			<Button
				aria-label={label}
				css={styles.trigger(mergedTheme)}
				onPress={() => setIsOpen(true)}
			>
				<Icon size={iconSize} symbol={symbol} />
			</Button>
			<AriaTooltip
				placement={placement}
				css={[styles.tooltip(mergedTheme), cssOverrides]}
			>
				<TooltipArrow theme={mergedTheme} />
				<Typography variant="metaMd" theme={{ color: mergedTheme.color }}>
					{children}
				</Typography>
			</AriaTooltip>
		</TooltipTrigger>
	);
};

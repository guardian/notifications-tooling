import { css } from '@emotion/react';
import { baseColors, componentTooltip, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components';
import { formatLocalSendTimes } from '../utils/history-send-time';

const styles = {
	trigger: css({
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		appearance: 'none',
		border: 'none',
		padding: 0,
		background: 'none',
		color: baseColors.magenta[800],
		cursor: 'pointer',
	}),
	tooltip: css({
		padding: componentTooltip.tooltip.padding,
		maxWidth: componentTooltip.tooltip.maxWidth,
		color: componentTooltip.shared.color,
		backgroundColor: baseColors.magenta[800],
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
	arrow: css({
		display: 'block',
		fill: componentTooltip.shared.backgroundColor,
	}),
	list: css({
		display: 'grid',
		gridTemplateColumns: 'auto auto',
		columnGap: semanticSpacing.stackXs,
		margin: 0,
		padding: 0,
		listStyle: 'none',
		whiteSpace: 'nowrap',
	}),
	listItem: css({
		display: 'contents',
	}),
};

const TooltipArrow = () => (
	<OverlayArrow>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="9"
			height="14"
			viewBox="0 0 9 14"
			css={styles.arrow}
		>
			<path d="M0 6.928 9 0v13.856z" />
		</svg>
	</OverlayArrow>
);

export const SendTimeTooltip = ({ sentAt }: { sentAt: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	const localSendTimes = formatLocalSendTimes(sentAt);

	if (localSendTimes.length === 0) {
		return null;
	}

	return (
		<TooltipTrigger
			delay={0}
			closeDelay={0}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
		>
			<Button
				aria-label="Local send times"
				css={styles.trigger}
				onPress={() => setIsOpen(true)}
			>
				<Icon size="sm" symbol="info" />
			</Button>
			<Tooltip placement="top" css={styles.tooltip}>
				<TooltipArrow />
				<Typography
					variant="metaMd"
					theme={{ color: componentTooltip.shared.color }}
				>
					<ul css={styles.list}>
						{localSendTimes.map(({ region, time }) => (
							<li key={region} css={styles.listItem}>
								<span>{region}</span>
								<span>{time}</span>
							</li>
						))}
					</ul>
				</Typography>
			</Tooltip>
		</TooltipTrigger>
	);
};

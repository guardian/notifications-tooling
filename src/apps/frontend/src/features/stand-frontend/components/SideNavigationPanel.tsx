import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';

interface SideNavigationPanelTileProps {
	title: string;
	tileNumber: number;
	href: string;
}

const SIDE_NAVIGATION_PANEL_ITEMS: SideNavigationPanelTileProps[] = [
	{ tileNumber: 1, title: 'Article and channel', href: '#article-section' },
	{ tileNumber: 2, title: 'Content', href: '#kicker-section' },
	{ tileNumber: 3, title: 'Audience', href: '#audience-section' },
	{
		tileNumber: 4,
		title: 'Timing and Delivery',
		href: '#delivery-timing-section',
	},
	{ tileNumber: 5, title: 'Send', href: '#preview-section' },
];

const sideNavigationPanelTileStyle = {
	tileNumberStyle: css({
		minHeight: '72px',
		width: '32px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRight: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
		padding: `${baseSpacing['12Px']} ${baseSpacing['10Px']}`,
		gap: `${baseSpacing['10Px']}`,
		active: {
			backgroundColor: baseColors.magenta[200],
			color: semanticColors.text.strongerInverse,
		},
	}),
	tileStyle: css({
		height: '50px',
		width: '100%',
		padding: `${baseSpacing['16Px']} ${baseSpacing['12Px']}`,
		gap: `${baseSpacing['4Px']}`,
	}),
	tileTextStyle: css({
		fontSize: '16px',
	}),
};

export const SideNavigationPanel = () => {
	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
				minHeight: '72px',
			}}
		>
			{SIDE_NAVIGATION_PANEL_ITEMS.map((item) => (
				<SideNavigationPanelTile
					key={item.title}
					tileNumber={item.tileNumber}
					title={item.title}
					href={item.href}
				/>
			))}
		</div>
	);
};

export const SideNavigationPanelTile = ({
	title,
	tileNumber,
	href,
}: SideNavigationPanelTileProps) => {
	return (
		<LinkButton
			href={href}
			variant="tertiary"
			css={{
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '72px',
				border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
				padding: '0px 0px',
			}}
		>
			<Typography
				variant="headingLg"
				cssOverrides={sideNavigationPanelTileStyle.tileNumberStyle}
			>
				{tileNumber}
			</Typography>
			<div css={sideNavigationPanelTileStyle.tileStyle}>
				<Typography
					variant="headingMd"
					cssOverrides={sideNavigationPanelTileStyle.tileTextStyle}
				>
					{title}
				</Typography>
			</div>
		</LinkButton>
	);
};

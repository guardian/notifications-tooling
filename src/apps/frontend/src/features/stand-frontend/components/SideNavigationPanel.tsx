import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';

interface SideNavigationPanelTileProps {
	title: string;
	tileNumber: number;
	href: string;
	trackedSectionId: string;
	isSelected: boolean;
	onPress?: () => void;
}

export const SIDE_NAVIGATION_PANEL_ITEMS: SideNavigationPanelTileProps[] = [
	{
		tileNumber: 1,
		title: 'Article and channel',
		href: '#article-section',
		trackedSectionId: 'article-section',
		isSelected: true,
	},
	{
		tileNumber: 2,
		title: 'Content',
		href: '#content-section',
		trackedSectionId: 'content-section',
		isSelected: false,
	},
	{
		tileNumber: 3,
		title: 'Audience',
		href: '#audience-section',
		trackedSectionId: 'audience-section',
		isSelected: false,
	},
	{
		tileNumber: 4,
		title: 'Timing and Delivery',
		href: '#delivery-timing-section',
		trackedSectionId: 'delivery-timing-section',
		isSelected: false,
	},
	{
		tileNumber: 5,
		title: 'Send',
		href: '#send-button-section',
		trackedSectionId: 'send-button-section',
		isSelected: false,
	},
];

export const DEFAULT_SIDE_NAV_HREF = SIDE_NAVIGATION_PANEL_ITEMS[0]?.href ?? '';

const sideNavigationPanelTileStyle = {
	tileNumberStyle: (isSelected: boolean, isSend: boolean) =>
		css({
			minHeight: '72px',
			width: '32px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRight: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
			borderBottom: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
			padding: `${baseSpacing['12Px']} ${baseSpacing['10Px']}`,
			gap: `${baseSpacing['10Px']}`,
			backgroundColor: isSelected
				? baseColors.magenta[200]
				: semanticColors.fill.weak,
			color: isSend
				? semanticColors.text.disabled
				: isSelected
					? semanticColors.text.strongerInverse
					: semanticColors.text.weak,
		}),
	tileStyle: css({
		height: '50px',
		width: '100%',
		padding: `${baseSpacing['16Px']} ${baseSpacing['12Px']}`,
		gap: `${baseSpacing['4Px']}`,
	}),
	tileTextStyle: (isSend: boolean) =>
		css({
			fontSize: '16px',
			color: isSend ? semanticColors.text.disabled : semanticColors.text.weak,
		}),
};

interface SideNavigationPanelProps {
	selectedHref: string;
	onSelectedHrefChange: (href: string) => void;
}

export const SideNavigationPanel = ({
	selectedHref,
	onSelectedHrefChange,
}: SideNavigationPanelProps) => {
	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
				minHeight: '72px',
				width: '280px',
				position: 'sticky',
				top: '0px',
				zIndex: 1,
			}}
		>
			{SIDE_NAVIGATION_PANEL_ITEMS.map((item) => (
				<SideNavigationPanelTile
					key={item.title}
					tileNumber={item.tileNumber}
					title={item.title}
					href={item.href}
					trackedSectionId={item.trackedSectionId}
					isSelected={selectedHref === item.href}
					onPress={() => onSelectedHrefChange(item.href)}
				/>
			))}
		</div>
	);
};

export const SideNavigationPanelTile = ({
	title,
	tileNumber,
	href,
	isSelected,
	onPress,
}: SideNavigationPanelTileProps) => {
	return (
		<LinkButton
			href={href}
			onPress={onPress}
			variant="tertiary"
			cssOverrides={css({
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '72px',
				backgroundColor: isSelected
					? semanticColors.bg.raisedLevel1
					: semanticColors.fill.weak,
				border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
				padding: '0px 0px',
			})}
		>
			<Typography
				variant="headingLg"
				cssOverrides={sideNavigationPanelTileStyle.tileNumberStyle(
					isSelected,
					title === 'Send',
				)}
			>
				{tileNumber}
			</Typography>
			<div css={sideNavigationPanelTileStyle.tileStyle}>
				<Typography
					variant="headingMd"
					cssOverrides={sideNavigationPanelTileStyle.tileTextStyle(
						title === 'Send',
					)}
				>
					{title}
				</Typography>
			</div>
		</LinkButton>
	);
};

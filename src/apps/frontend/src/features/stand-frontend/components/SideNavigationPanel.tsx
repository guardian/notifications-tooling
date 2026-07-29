import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';

interface SideNavigationPanelTileProps {
	title: string;
	tileNumber: number;
	href: string;
	isSelected: boolean;
	onPress: () => void;
}

const SIDE_NAVIGATION_PANEL_ITEMS: SideNavigationPanelTileProps[] = [
	{
		tileNumber: 1,
		title: 'Article and channel',
		href: '#article-section',
		isSelected: true,
		onPress: () => {},
	},
	{
		tileNumber: 2,
		title: 'Content',
		href: '#kicker-section',
		isSelected: false,
		onPress: () => {},
	},
	{
		tileNumber: 3,
		title: 'Audience',
		href: '#audience-section',
		isSelected: false,
		onPress: () => {},
	},
	{
		tileNumber: 4,
		title: 'Timing and Delivery',
		href: '#delivery-timing-section',
		isSelected: false,
		onPress: () => {},
	},
	{
		tileNumber: 5,
		title: 'Send',
		href: '#send-button-section',
		isSelected: false,
		onPress: () => {},
	},
];

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

export const SideNavigationPanel = () => {
	const [selectedHref, setSelectedHref] = useState<string>(
		SIDE_NAVIGATION_PANEL_ITEMS[0]?.href ?? '',
	);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
				minHeight: '72px',
				width: '280px',
			}}
		>
			{SIDE_NAVIGATION_PANEL_ITEMS.map((item) => (
				<SideNavigationPanelTile
					key={item.title}
					tileNumber={item.tileNumber}
					title={item.title}
					href={item.href}
					isSelected={selectedHref === item.href}
					onPress={() => setSelectedHref(item.href)}
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

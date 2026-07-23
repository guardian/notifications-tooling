import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';

// interface SideNavigationPanelProps {}

interface SideNavigationPanelTileProps {
	title: string;
	tileNumber: number;
}

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
	}),
	tileStyle: css({
		height: '50px',
		width: '100%',
		display: 'flex',
		padding: `${baseSpacing['16Px']} ${baseSpacing['12Px']}`,
		gap: `${baseSpacing['4Px']}`,
	}),
	tileTextStyle: css({
		size: '16px',
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
			<SideNavigationPanelTile tileNumber={1} title={'Article and channel'} />
			<SideNavigationPanelTile tileNumber={2} title={'Content'} />
			<SideNavigationPanelTile tileNumber={3} title={'Audience'} />
			<SideNavigationPanelTile tileNumber={4} title={'Timing and Delivery'} />
			<SideNavigationPanelTile tileNumber={5} title={'Send'} />
		</div>
	);
};

export const SideNavigationPanelTile = ({
	title,
	tileNumber,
}: SideNavigationPanelTileProps) => {
	return (
		<>
			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					gap: semanticSpacing.stackXs,
					borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
				}}
			>
				<Typography
					variant={'headingLg'}
					cssOverrides={sideNavigationPanelTileStyle.tileNumberStyle}
				>
					{tileNumber}
				</Typography>
				<div css={sideNavigationPanelTileStyle.tileStyle}>
					<Typography
						variant={'headingMd'}
						cssOverrides={sideNavigationPanelTileStyle.tileTextStyle}
					>
						{title}
					</Typography>
				</div>
			</div>
		</>
	);
};

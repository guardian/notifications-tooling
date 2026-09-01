import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { ReactNode } from 'react';
import { layer, topBarHeight } from '../themes';

interface PreviewSectionProps {
	title: string;
	description: string;
	children?: ReactNode;
}

export const PreviewSection = ({
	title,
	description,
	children,
}: PreviewSectionProps) => (
	<section
		css={css({
			background: semanticColors.bg.raisedLevel1,
			boxSizing: 'border-box',
			display: 'flex',
			flexDirection: 'column',
			gap: semanticSpacing.stackLg,
			paddingTop: semanticSpacing.stackMd,
			paddingLeft: semanticSpacing.stackMd,
			paddingRight: semanticSpacing.stackMd,
			paddingBottom: baseSpacing['48Px'],
			width: '100%',
			[from.md]: {
				paddingLeft: semanticSpacing.stackLg,
				paddingRight: semanticSpacing.stackLg,
				paddingTop: semanticSpacing.stackLg,
			},
			[from.lg]: {
				flexBasis: 474,
				paddingTop: '48px',
				position: 'sticky',
				top: topBarHeight,
				zIndex: layer.stickyContent,
			},
			'@media (min-width: 1310px)': {
				height: '100vh',
				overflowY: 'auto',
			},
		})}
	>
		<div
			css={css({
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackLg,
				'@media (min-width: 1310px)': {
					paddingBottom: topBarHeight,
				},
			})}
		>
			<header
				css={css({
					display: 'flex',
					flexDirection: 'column',
					gap: baseSpacing['12Px'],
					alignItems: 'stretch',
				})}
			>
				<div
					css={{
						display: 'flex',
						alignItems: 'center',
						gap: 5,
					}}
				>
					<Icon symbol="preview" />
					<Typography variant="bodyBoldMd">{title}</Typography>
				</div>
				<Typography variant="bodySm">{description}</Typography>
			</header>
			{children}
		</div>
	</section>
);

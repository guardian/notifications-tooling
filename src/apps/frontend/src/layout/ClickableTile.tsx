import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { ComponentProps } from 'react';
import { phoneIphoneIcon } from '../ui/FlagIcons';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];

interface ClickableTileProps {
	title: string;
	icon: string;
	href: string;
}

const tileStyles = {
	tileButtonStyle: css({
		width: '100%',
		height: '74px',
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		borderRadius: semanticRadius.cornerSm,
		[from.md]: {
			width: '300px',
		},
	}),
	topRow: css({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		padding: '12px 8px 0 0',
	}),
	arrowRow: css({
		display: 'flex',
		justifyContent: 'flex-end',
		paddingRight: '8px',
		paddingBottom: '8px',
	}),
};

export const ClickableTile = ({ title, icon, href }: ClickableTileProps) => {
	return (
		<div>
			<LinkButton
				variant="tertiary"
				size="md"
				cssOverrides={tileStyles.tileButtonStyle}
				href={href}
			>
				<div css={tileStyles.topRow}>
					{icon !== 'appAlert' && (
						<Icon
							symbol={icon as IconSymbol}
							size="sm"
							cssOverrides={css({ width: '20px' })}
						/>
					)}
					{icon === 'appAlert' && (
						<Icon size="sm" cssOverrides={css({ width: '20px' })}>
							{phoneIphoneIcon}
						</Icon>
					)}
					<Typography variant="headingMd">{title}</Typography>
				</div>

				<div css={tileStyles.arrowRow}>
					<Icon symbol="arrow_forward" size="md" />
				</div>
			</LinkButton>
		</div>
	);
};

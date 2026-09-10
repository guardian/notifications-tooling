import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import type { ComponentProps } from 'react';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];

interface ClickableTileProps {
	title: string;
	icon: IconSymbol;
	href: string;
}

const tileStyles = {
	tileButtonStyle: css({
		width: '300px',
		height: '74px',
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		justifyContent: 'space-between',
		alignItems: 'stretch',
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
					<Icon symbol={icon} size="sm" cssOverrides={css({ width: '20px' })} />
					<Typography variant="headingMd">{title}</Typography>
				</div>

				<div css={tileStyles.arrowRow}>
					<Icon symbol="arrow_forward" size="md" />
				</div>
			</LinkButton>
		</div>
	);
};

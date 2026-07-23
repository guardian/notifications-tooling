import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';

interface Props {
	count: number;
	hardLimit?: number;
	softLimit: number;
	fieldDescription: string;
}

const styles = {
	container: css({
		display: 'flex',
		justifyContent: 'space-between',
		maxWidth: semanticSizing.input.maxWidthPx,
		paddingTop: semanticSpacing.stackXxs,
		flexWrap: 'wrap-reverse',
		gap: semanticSpacing.stackXs,
	}),

	badgeAndText: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
	}),

	countAndLimit: css({
		marginLeft: 'auto',
		flexShrink: 0,
	}),

	count: (level?: 'warn' | 'error') => {
		const base = {
			display: 'inline-block',
		};
		switch (level) {
			case 'error':
				return css({
					...base,
					fontWeight: 'bold',
					color: semanticColors.text.error,
				});

			case 'warn':
				return css({
					...base,
					fontWeight: 'bold',
					display: 'inline-block',
					color: semanticColors.text.warning,
				});

			default:
				return css(base);
		}
	},
};

// TODO - replace with Stand/Badge when released
const Badge = ({
	children,
	color,
}: {
	children: ReactNode;
	color: 'green' | 'yellow' | 'red';
}) => {
	const getBackgroundColor = (color: 'green' | 'yellow' | 'red') => {
		switch (color) {
			case 'green':
				return semanticColors.fill.greenWeak;
			case 'yellow':
				return semanticColors.fill.yellowWeak;
			case 'red':
				return semanticColors.fill.redWeak;
		}
	};
	return (
		<div
			css={{
				display: 'inline-block',
				paddingLeft: baseSpacing['4Px'],
				paddingRight: baseSpacing['4Px'],
				lineHeight: 1,
				backgroundColor: getBackgroundColor(color),
			}}
		>
			<Typography variant="bodyXs">{children}</Typography>
		</div>
	);
};

export const CharacterCount = ({
	count,
	hardLimit = Infinity,
	softLimit,
	fieldDescription,
}: Props) => {
	const warningLevel =
		count <= softLimit ? undefined : count <= hardLimit ? 'warn' : 'error';

	return (
		<div css={styles.container}>
			<div css={styles.badgeAndText}>
				{!warningLevel && <Badge color="green">Recommended</Badge>}
				{warningLevel === 'warn' && <Badge color="yellow">Warning</Badge>}
				{warningLevel === 'error' && <Badge color="red">Limit Reached</Badge>}
				<Typography variant="bodySm">
					{softLimit} characters or fewer preferred
				</Typography>
			</div>
			<div
				aria-live="polite"
				aria-label={`${fieldDescription} character count`}
				css={styles.countAndLimit}
			>
				<Typography cssOverrides={styles.count(warningLevel)}>
					{count}
				</Typography>
				<Typography>/</Typography>
				<Typography>{softLimit}</Typography>
			</div>
		</div>
	);
};

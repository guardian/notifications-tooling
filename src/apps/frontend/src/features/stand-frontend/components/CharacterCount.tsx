import { css } from '@emotion/react';
import { semanticColors, semanticSizing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';

interface Props {
	count: number;
	hardLimit?: number;
	softLimit: number;
	fieldDescription: string;
}

const styles = {
	container: css({
		display: 'flex',
		justifyContent: 'flex-end',
		maxWidth: semanticSizing.input.maxWidthPx,
	}),

	count: (level?: 'warn' | 'error') => {
		const base = {
			display: 'inline-block',
		};
		switch (level) {
			case 'error':
				return css({
					...base,
					color: semanticColors.text.error,
					backgroundColor: semanticColors.fill.errorWeak,
				});

			case 'warn':
				return css({
					...base,
					display: 'inline-block',
					color: semanticColors.text.warning,
					backgroundColor: semanticColors.fill.warningWeak,
				});

			default:
				return css(base);
		}
	},
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
		<div
			css={styles.container}
			aria-live="polite"
			aria-label={`${fieldDescription} character count`}
		>
			<Typography cssOverrides={styles.count(warningLevel)}>{count}</Typography>
			<Typography>/</Typography>
			<Typography>{softLimit}</Typography>
		</div>
	);
};

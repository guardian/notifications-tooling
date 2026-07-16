/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import type { ReactNode } from 'react';

const styles = {
	field: css({
		paddingBottom: '24px',
		marginBottom: '24px',
		borderBottom: `1px solid ${semanticColors.border.weaker}`,
		'&:last-of-type': {
			borderBottom: 'none',
			marginBottom: 0,
		},
	}),
	label: css({
		display: 'block',
		marginBottom: '12px',
		fontSize: '1.0625rem',
		fontWeight: 700,
		color: semanticColors.text.strong,
	}),
};

interface FieldProps {
	label: ReactNode;
	htmlFor?: string;
	children: ReactNode;
}

/** A labelled form section with a heading and a separating divider. */
export function Field({ label, htmlFor, children }: FieldProps) {
	return (
		<div css={styles.field}>
			<label css={styles.label} htmlFor={htmlFor}>
				{label}
			</label>
			{children}
		</div>
	);
}

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { DELIVERY_OPTIONS } from '../constants';
import type { DeliveryMode } from '../types';

const styles = {
	group: css({
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		gap: '12px',
		margin: 0,
		padding: 0,
		border: 'none',
	}),
	legend: css({
		position: 'absolute',
		width: '1px',
		height: '1px',
		padding: 0,
		margin: '-1px',
		overflow: 'hidden',
		clip: 'rect(0, 0, 0, 0)',
		whiteSpace: 'nowrap',
		border: 0,
	}),
	card: css({
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		padding: '16px',
		borderRadius: '8px',
		border: `1px solid ${semanticColors.border.weak}`,
		backgroundColor: semanticColors.bg.base,
		cursor: 'pointer',
		transition: 'border-color 0.15s, background-color 0.15s',
		'&:hover': {
			borderColor: semanticColors.border.strong,
		},
		'&:has(input:focus-visible)': {
			outline: `2px solid ${semanticColors.border.focused}`,
			outlineOffset: '2px',
		},
		'&:has(input:checked)': {
			borderColor: semanticColors.border.selected,
			backgroundColor: semanticColors.fill.selectedWeak,
		},
	}),
	input: css({
		position: 'absolute',
		opacity: 0,
		pointerEvents: 'none',
	}),
	header: css({
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		fontWeight: 700,
		color: semanticColors.text.strong,
	}),
	description: css({
		fontSize: '0.875rem',
		color: semanticColors.text.weak,
	}),
};

interface DeliveryOptionsProps {
	selected: DeliveryMode;
	onSelect: (mode: DeliveryMode) => void;
}

/** Radio-group of delivery/timing strategy cards backed by native radios. */
export function DeliveryOptions({ selected, onSelect }: DeliveryOptionsProps) {
	return (
		<fieldset css={styles.group}>
			<legend css={styles.legend}>Delivery &amp; timing</legend>
			{DELIVERY_OPTIONS.map((option) => (
				<label key={option.id} css={styles.card}>
					<input
						css={styles.input}
						type="radio"
						name="deliveryMode"
						value={option.id}
						checked={option.id === selected}
						onChange={() => onSelect(option.id)}
					/>
					<span css={styles.header}>
						<Icon symbol={option.icon} size="md" />
						{option.title}
					</span>
					<span css={styles.description}>{option.description}</span>
				</label>
			))}
		</fieldset>
	);
}

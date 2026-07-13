/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import type { IconProps } from '@guardian/stand/Icon';
import { Icon } from '@guardian/stand/Icon';
import { useState } from 'react';
import type { ComposerTab } from '../types';
import type { DispatchState } from '../useDispatchState';
import { AudiencePanel } from './AudiencePanel';
import { ContentPanel } from './ContentPanel';
import { DeliveryPanel } from './DeliveryPanel';

const TABS: { id: ComposerTab; label: string; icon: IconProps['symbol'] }[] = [
	{ id: 'content', label: 'Content', icon: 'description' },
	{ id: 'audience', label: 'Audience', icon: 'group' },
	{ id: 'delivery', label: 'Delivery', icon: 'schedule' },
];

const styles = {
	bar: css({
		display: 'flex',
		alignItems: 'stretch',
		borderBottom: `1px solid ${semanticColors.border.weak}`,
		backgroundColor: semanticColors.bg.raisedLevel2,
	}),
	tabs: css({
		display: 'flex',
		flex: 1,
	}),
	tab: css({
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		padding: '16px 20px',
		border: 'none',
		borderBottom: '3px solid transparent',
		background: 'none',
		cursor: 'pointer',
		fontSize: '1rem',
		fontWeight: 700,
		color: semanticColors.text.weak,
		'&:hover': {
			color: semanticColors.text.strong,
		},
		'&:focus-visible': {
			outline: `2px solid ${semanticColors.border.focused}`,
			outlineOffset: '-2px',
		},
	}),
	tabActive: css({
		color: semanticColors.text.strong,
		backgroundColor: semanticColors.bg.base,
		borderBottomColor: semanticColors.border.accent,
	}),
	close: css({
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		padding: '16px 20px',
		border: 'none',
		background: 'none',
		cursor: 'pointer',
		fontSize: '1rem',
		fontWeight: 700,
		color: semanticColors.text.weak,
		'&:hover': {
			color: semanticColors.text.strong,
		},
		'&:focus-visible': {
			outline: `2px solid ${semanticColors.border.focused}`,
			outlineOffset: '-2px',
		},
	}),
	panel: css({
		padding: '24px',
	}),
};

interface ComposerTabsProps {
	state: DispatchState;
	onClose: () => void;
}

/** Tab navigation (Content / Audience / Delivery) plus the active panel. */
export function ComposerTabs({ state, onClose }: ComposerTabsProps) {
	const [activeTab, setActiveTab] = useState<ComposerTab>('content');

	return (
		<div>
			<div css={styles.bar}>
				<div css={styles.tabs} role="tablist" aria-label="Compose dispatch">
					{TABS.map((tab) => {
						const isActive = tab.id === activeTab;
						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								aria-selected={isActive}
								aria-controls={`panel-${tab.id}`}
								id={`tab-${tab.id}`}
								onClick={() => setActiveTab(tab.id)}
								css={[styles.tab, isActive && styles.tabActive]}
							>
								<Icon symbol={tab.icon} size="sm" />
								{tab.label}
							</button>
						);
					})}
				</div>
				<button type="button" css={styles.close} onClick={onClose}>
					<Icon symbol="close" size="sm" />
					Close
				</button>
			</div>
			<div
				css={styles.panel}
				role="tabpanel"
				id={`panel-${activeTab}`}
				aria-labelledby={`tab-${activeTab}`}
			>
				{activeTab === 'content' && <ContentPanel state={state} />}
				{activeTab === 'audience' && <AudiencePanel state={state} />}
				{activeTab === 'delivery' && <DeliveryPanel state={state} />}
			</div>
		</div>
	);
}

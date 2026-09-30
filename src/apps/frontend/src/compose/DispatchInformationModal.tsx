import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
import type { ComponentProps, ReactNode } from 'react';
import {
	CENTRAL_PRODUCTION_CONTACT_HREF,
	DISPATCH_RUNBOOK_URL,
} from '../support-links';
import { dispatchTileModalTheme } from '../themes';

export const DISPATCH_INFORMATION_MODAL_TITLE =
	'Dispatch information and support';

const tileStyles = css({
	width: '100%',
});

const tileLabelStyles = css({
	display: 'inline-flex',
	alignItems: 'center',
	gap: baseSpacing['6Px'],
});

interface TileLabelProps {
	children: ReactNode;
	symbol: ComponentProps<typeof Icon>['symbol'];
}

const TileLabel = ({ children, symbol }: TileLabelProps) => (
	<span css={tileLabelStyles}>
		<Icon size="sm" symbol={symbol} />
		{children}
	</span>
);

interface DispatchInformationModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

export const DispatchInformationModal = ({
	isOpen,
	onOpenChange,
}: DispatchInformationModalProps) => (
	<Modal
		isOpen={isOpen}
		onOpenChange={onOpenChange}
		theme={dispatchTileModalTheme.modal}
	>
		<Dialog aria-label={DISPATCH_INFORMATION_MODAL_TITLE}>
			<Dialog.Dismiss ariaLabel="Close Modal" />
			<Dialog.Header>{DISPATCH_INFORMATION_MODAL_TITLE}</Dialog.Header>
			<Dialog.Content>
				<div css={dispatchTileModalTheme.tileList}>
					<Tile
						size="sm"
						href={DISPATCH_RUNBOOK_URL}
						target="_blank"
						rel="noopener noreferrer"
						icon=""
						typography="headingMd"
						cssOverrides={tileStyles}
					>
						<TileLabel symbol="library_books">View Dispatch runbook</TileLabel>
					</Tile>
					<Tile
						size="sm"
						href={CENTRAL_PRODUCTION_CONTACT_HREF}
						icon=""
						typography="headingMd"
						target="_blank"
						cssOverrides={tileStyles}
					>
						<TileLabel symbol="info">Contact Central Production</TileLabel>
					</Tile>
				</div>
			</Dialog.Content>
		</Dialog>
	</Modal>
);

import { css } from '@emotion/react';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
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
						icon="library_books"
						typography="headingMd"
						cssOverrides={tileStyles}
					>
						View Dispatch runbook
					</Tile>
					<Tile
						size="sm"
						href={CENTRAL_PRODUCTION_CONTACT_HREF}
						icon="info"
						typography="headingMd"
						cssOverrides={tileStyles}
					>
						Contact Central Production
					</Tile>
				</div>
			</Dialog.Content>
		</Dialog>
	</Modal>
);

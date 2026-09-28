import { css } from '@emotion/react';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
import { from } from '@guardian/stand/utils';
import { getAppRoutes, withArticleUrl } from '../routes';
import { dispatchTileModalTheme } from '../themes';
import { phoneIphoneIcon } from '../ui/flag-icons';

interface DispatchCreateNotificationModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	articleUrl?: string;
}

export const DispatchCreateNotificationModal = ({
	isOpen,
	onOpenChange,
	articleUrl,
}: DispatchCreateNotificationModalProps) => {
	const routes = getAppRoutes();
	const createAppAlertHref = withArticleUrl(
		routes.createAppAlert,
		articleUrl ?? '',
	);
	const createNewsletterEmailHref = withArticleUrl(
		routes.createNewsletterEmail,
		articleUrl ?? '',
	);
	const tileStyles = css({
		width: '100%',
		[from.md]: {
			width: '420px',
		},
	});

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			theme={dispatchTileModalTheme.modal}
		>
			<Dialog aria-label="Choose an alert type for this content">
				<Dialog.Dismiss ariaLabel="Close Modal" />
				<Dialog.Header>Choose an alert type for this content</Dialog.Header>
				<Dialog.Content>
					<div css={dispatchTileModalTheme.tileList}>
						<Tile
							size="sm"
							href={createAppAlertHref}
							icon={phoneIphoneIcon}
							typography="headingMd"
							cssOverrides={tileStyles}
						>
							Create an app alert
						</Tile>
						<Tile
							size="sm"
							href={createNewsletterEmailHref}
							icon="mail"
							typography="headingMd"
							cssOverrides={tileStyles}
						>
							Create a newsletter email
						</Tile>
					</div>
				</Dialog.Content>
			</Dialog>
		</Modal>
	);
};

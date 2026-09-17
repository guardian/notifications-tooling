import { css } from '@emotion/react';
import { semanticRadius, semanticSpacing } from '@guardian/stand';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { getAppRoutes } from '../routes';
import { phoneIphoneIcon } from '../ui/flag-icons';

interface DispatchCreateNotificationModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

export const DispatchCreateNotificationModal = ({
	isOpen,
	onOpenChange,
}: DispatchCreateNotificationModalProps) => {
	const config = useContext(ConfigContext);
	const routes = getAppRoutes(config);
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
			theme={{
				overlay: {
					position: 'fixed',
				},
				modal: {
					width: '484px',
					maxWidth: 'min(484px, 90svw)',
					maxHeight: '352px',
					borderRadius: semanticRadius.cornerMd,
					padding: {
						top: semanticSpacing.stackMd,
						bottom: semanticSpacing.stackLg,
						left: semanticSpacing.stackLg,
						right: semanticSpacing.stackLg,
					},
					boxShadow: '0px 2px 6px 0px #0000004D',
				},
			}}
		>
			<Dialog aria-label="Choose an alert type for this content">
				<Dialog.Dismiss ariaLabel="Close Modal" />
				<Dialog.Header>Choose an alert type for this content</Dialog.Header>
				<Dialog.Content>
					<div
						css={css({
							display: 'flex',
							flexDirection: 'column',
							gap: semanticSpacing.stackSm,
						})}
					>
						{routes.createAppAlert && (
							<Tile
								size="sm"
								href={routes.createAppAlert}
								icon={phoneIphoneIcon}
								typography="headingMd"
								cssOverrides={tileStyles}
							>
								Create an app alert
							</Tile>
						)}
						<Tile
							size="sm"
							href={routes.createNewsletterEmail}
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

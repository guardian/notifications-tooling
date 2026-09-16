import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { getAppRoutes } from '../routes';
import { phoneIphoneIcon } from '../ui/FlagIcons';

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
			width: '300px',
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
						<Tile
							size="sm"
							href={routes.createNewsletterEmail}
							icon="mail"
							typography="headingMd"
							cssOverrides={tileStyles}
						>
							Create a newsletter email
						</Tile>
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
					</div>
				</Dialog.Content>
			</Dialog>
		</Modal>
	);
};

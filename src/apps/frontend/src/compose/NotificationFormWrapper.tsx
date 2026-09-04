import { semanticSpacing } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import type { ResolvedArticle } from '@models';
import {
	type FormEventHandler,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { SendButton } from '../send/SendButton';
import { SendFailedModal } from '../send/SendFailedModal';
import { SendNotificationModal } from '../send/SendNotificationModal';
import type { ChannelOption } from '../types';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelDisplay } from './ChannelDisplay';
import { CreateFormTitle } from './CreateFormTitle';
import { DeliveryOptionFormField } from './DeliveryOptionFormField';
import { NotificationFormContext } from './NotificationContext';
import { NotificationFormSection } from './NotificationFormSection';

interface NotificationFormWrapperProps {
	activeSectionHref: string;
	title: string;
	formLabel: string;
	channel: ChannelOption;
	sendButtonLabel: string;
	onSubmit: FormEventHandler<HTMLFormElement>;
	onResetNotification: () => void;
	onArticleImported: (article: ResolvedArticle) => void;
	showArticleThumbnail?: boolean;
}

export const NotificationFormWrapper = ({
	activeSectionHref,
	title,
	formLabel,
	channel,
	sendButtonLabel,
	onSubmit,
	onResetNotification,
	onArticleImported,
	showArticleThumbnail,
	children,
}: PropsWithChildren<NotificationFormWrapperProps>) => {
	const { notification } = useContext(NotificationFormContext);
	const [articleInputText, setArticleInputText] = useState(
		() => notification.content?.webUrl ?? '',
	);
	const [lockArticleInputText, setLockArticleInputText] = useState(false);

	return (
		<>
			<form
				aria-label={formLabel}
				method="post"
				noValidate
				onSubmit={onSubmit}
				css={{
					marginTop: semanticSpacing.stackXl,
					marginBottom: semanticSpacing.stackXl,
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackXl,
				}}
			>
				<CreateFormTitle
					title={title}
					setArticleInputText={setArticleInputText}
					setLockArticleInputText={setLockArticleInputText}
					onResetNotification={onResetNotification}
				/>

				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: semanticSpacing.stackLg,
						width: '100%',
						[from.md]: {
							maxWidth: '500px',
						},
					}}
				>
					<NotificationFormSection
						id="article-section"
						isActive={activeSectionHref === '#article-section'}
					>
						<ArticleImportControl
							articleInputText={articleInputText}
							setArticleInputText={setArticleInputText}
							lockArticleInputText={lockArticleInputText}
							setLockArticleInputText={setLockArticleInputText}
							onArticleImported={onArticleImported}
							showThumbnail={showArticleThumbnail}
						/>
						<ChannelDisplay channel={channel} />
					</NotificationFormSection>

					{children}

					<NotificationFormSection
						id="delivery-timing-section"
						isActive={activeSectionHref === '#delivery-timing-section'}
					>
						<DeliveryOptionFormField channel={channel} />
					</NotificationFormSection>
					<NotificationFormSection
						id="send-button-section"
						isActive={activeSectionHref === '#send-button-section'}
					>
						<SendButton>{sendButtonLabel}</SendButton>
					</NotificationFormSection>
				</div>
			</form>
			<SendNotificationModal />
			<SendFailedModal />
		</>
	);
};

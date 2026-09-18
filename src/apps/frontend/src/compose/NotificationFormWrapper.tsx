import { semanticSpacing } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import type { CapiBlock, ResolvedArticle } from '@models';
import {
	type FormEventHandler,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { SendButton } from '../send/SendButton';
import { SendConfirmationModal } from '../send/SendConfirmationModal';
import { SendFailedModal } from '../send/SendFailedModal';
import type { ChannelOption } from '../types';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelDisplay } from './ChannelDisplay';
import { CreateFormTitle } from './CreateFormTitle';
import { DeliveryOptionFormField } from './DeliveryOptionFormField';
import { NotificationFormContext } from './NotificationFormContext';
import { NotificationFormSection } from './NotificationFormSection';

interface NotificationFormWrapperProps {
	title: string;
	formLabel: string;
	channel: ChannelOption;
	initialArticleUrl?: string;
	sendButtonLabel: string;
	onSubmit: FormEventHandler<HTMLFormElement>;
	onResetNotification: () => void;
	onArticleImported: (
		article: ResolvedArticle,
		requestedBlock?: CapiBlock,
	) => void;
}

export const NotificationFormWrapper = ({
	title,
	formLabel,
	channel,
	initialArticleUrl,
	sendButtonLabel,
	onSubmit,
	onResetNotification,
	onArticleImported,
	children,
}: PropsWithChildren<NotificationFormWrapperProps>) => {
	const { composerState } = useContext(NotificationFormContext);
	const [articleInputText, setArticleInputText] = useState(
		() => initialArticleUrl ?? composerState.article?.webUrl ?? '',
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
					<NotificationFormSection id="article-section">
						<ArticleImportControl
							articleInputText={articleInputText}
							autoFetch={Boolean(initialArticleUrl)}
							setArticleInputText={setArticleInputText}
							lockArticleInputText={lockArticleInputText}
							setLockArticleInputText={setLockArticleInputText}
							onArticleImported={onArticleImported}
						/>
						<ChannelDisplay channel={channel} />
					</NotificationFormSection>

					{children}

					<NotificationFormSection id="delivery-timing-section">
						<DeliveryOptionFormField channel={channel} />
					</NotificationFormSection>
					<NotificationFormSection id="send-button-section">
						<SendButton>{sendButtonLabel}</SendButton>
					</NotificationFormSection>
				</div>
			</form>
			<SendConfirmationModal />
			<SendFailedModal />
		</>
	);
};

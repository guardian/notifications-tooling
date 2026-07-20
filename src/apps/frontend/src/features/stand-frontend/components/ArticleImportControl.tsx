import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';
import type { CapiContent } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

const testFetch = (articleId: string): Promise<CapiContent> => {
	return new Promise<CapiContent>((resolve, reject) => {
		console.log('fake fetching', articleId);
		setTimeout(() => {
			if (articleId === '/') {
				reject(new Error('no fetch logic yet'));
			} else {
				resolve({ id: articleId });
			}
		}, 500);
	});
};

export const ArticleImportControl = () => {
	const { notification, updateNotification } = useContext(NotificationContext);

	const {
		articleId = '',
		fetchedArticleId,
		isFetchingContent,
		fetchArticleError,
	} = notification;

	const fetchArticle = () => {
		updateNotification({ type: 'waiting-for-article' });

		testFetch(articleId)
			.then((content) => {
				updateNotification({
					type: 'receive-article',
					content,
				});
			})
			.catch((err) => {
				// TO DO - error reporting/telemetry
				updateNotification({
					type: 'report-article-error',
					errorMessage: err instanceof Error ? err.message : 'UNKNOWN ERROR',
				});
			});
	};

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<TextInput
				label="Article"
				value={notification.articleId ?? ''}
				isDisabled={isFetchingContent}
				description="Copy and paste a Guardian URL below"
				onChange={(text) =>
					updateNotification({ type: 'set-article-id', text })
				}
			/>
			<div
				css={{
					display: 'flex',
					gap: semanticSpacing.stackSm,
					alignItems: 'center',
				}}
			>
				<Button
					isDisabled={articleId.length === 0 || isFetchingContent}
					icon="upload"
					size="sm"
					variant="secondary"
					onClick={fetchArticle}
				>
					Fetch Article
				</Button>

				{isFetchingContent && <LoadingSpinner />}

				{!isFetchingContent && fetchedArticleId === articleId && (
					<InlineMessage level="success">Article Imported</InlineMessage>
				)}

				{fetchArticleError && (
					<InlineMessage level="error">{fetchArticleError}</InlineMessage>
				)}
			</div>
		</div>
	);
};

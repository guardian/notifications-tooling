import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ApiError } from '../api-client/errors';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ArticlePreviewCard } from './ArticlePreviewCard';
import { parseArticleUrlInputToContentId } from './form-validation';
import { NotificationFormContext } from './NotificationContext';

// TO DO - more helpful error UI
// can we capture when article was taken down?
const getUserFacingError = (err: ApiError): string => {
	switch (err.failure) {
		case 'unauthenticated':
		case 'forbidden':
		case 'timeout':
		case 'fetch-fail':
		case 'json-parse-fail':
		case 'schema-parse-fail':
			return err.message;
		case 'non-2xx-response':
			switch (err.status) {
				case 404:
					return 'The URL is in the right format, but there is no article live there';
				default:
					return err.message;
			}
	}
};

export interface ArticleImportControlProps {
	articleInputText: string;
	setArticleInputText: (setArticleInputText: string) => void;
	lockArticleInputText: boolean;
	setLockArticleInputText: (lockArticleInputText: boolean) => void;
	onArticleImported: (article: ResolvedArticle) => void;
	showThumbnail?: boolean;
}
export const ArticleImportControl = ({
	articleInputText,
	setArticleInputText,
	lockArticleInputText,
	setLockArticleInputText,
	onArticleImported,
	showThumbnail,
}: ArticleImportControlProps) => {
	const { notification, updateNotification, capiFetch } = useContext(
		NotificationFormContext,
	);
	const {
		clearErrors,
		formState: { submitCount },
	} = useFormContext();

	const { fetchedArticleId, isFetchingContent, fetchArticleError, content } =
		notification;

	const { failure, webUrl, articleId } =
		parseArticleUrlInputToContentId(articleInputText);

	const fetchArticle = () => {
		if (articleInputText === '') {
			updateNotification({
				type: 'report-article-error',
				errorMessage: 'Paste a URL to fetch an article',
			});
			return;
		}

		if (!webUrl) {
			return;
		}

		updateNotification({ type: 'waiting-for-article' });
		void capiFetch({
			article: webUrl,
		}).then((result) => {
			if (!result.success) {
				// TO DO - error reporting/telemetry
				return updateNotification({
					type: 'report-article-error',
					errorMessage: getUserFacingError(result.failure),
				});
			}
			const { article } = result.data;
			onArticleImported(article);
			clearErrors('root');
			updateNotification({
				type: 'receive-article',
				content: article,
			});
			setLockArticleInputText(true);
		});
	};

	const showImportedArticle =
		!isFetchingContent && !!fetchedArticleId && fetchedArticleId === articleId;
	const articleError =
		failure ??
		fetchArticleError ??
		(!content && submitCount > 0
			? 'Paste a URL to fetch an article'
			: undefined);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					gap: semanticSpacing.stackSm,
					alignItems: 'flex-end',
				}}
			>
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: semanticSpacing.stackXxs,
					}}
				>
					<Typography variant="bodyBoldMd" element="h3">
						Article
					</Typography>
					{/*
						NOTE - we are not using the "description" field of the TextInput for this text
						as design does not want the colour shade to change when the TextInput is in the
						disabled state.
						*/}
					<Typography
						variant="helpTextFormMd"
						theme={{ color: semanticColors.text.weak }}
					>
						Copy and paste a Guardian article URL and fetch
					</Typography>

					<TextInput
						name="articleUrl"
						aria-label="article URL"
						isInvalid={!!articleError}
						size="sm"
						value={articleInputText}
						placeholder="https://www.theguardian.com/..."
						isDisabled={isFetchingContent || lockArticleInputText}
						onChange={setArticleInputText}
						cssOverrides={css({ width: '356px' })}
					/>
				</div>
				{!lockArticleInputText && (
					<Button
						type="button"
						isDisabled={isFetchingContent}
						icon="upload"
						size="sm"
						variant="secondary"
						onClick={fetchArticle}
					>
						Fetch
					</Button>
				)}
				{lockArticleInputText && (
					<Button
						type="button"
						isDisabled={isFetchingContent}
						icon="refresh"
						size="sm"
						variant="secondary"
						onClick={() => {
							setLockArticleInputText(false);
						}}
					>
						Replace
					</Button>
				)}
			</div>
			<div
				css={{
					display: 'flex',
					gap: semanticSpacing.stackSm,
					alignItems: 'left',
					paddingTop: semanticSpacing.stackXs,
					paddingBottom: semanticSpacing.stackXs,
				}}
			>
				{isFetchingContent && <LoadingSpinner />}

				{showImportedArticle && (
					<InlineMessage level="success">Article imported</InlineMessage>
				)}

				{articleError && (
					<InlineMessage level="error">{articleError}</InlineMessage>
				)}
			</div>

			{showImportedArticle && content && (
				<ArticlePreviewCard content={content} showThumbnail={showThumbnail} />
			)}
		</div>
	);
};

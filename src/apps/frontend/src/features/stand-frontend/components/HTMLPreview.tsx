import { HtmlPreviewLoader } from '@guardian/stand/HtmlPreviewLoader';
import { Typography } from '@guardian/stand/Typography';
import { useCallback, useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';

export const HTMLPreview = () => {
	const {
		notification: { fetchedArticleId },
		requestEmailHtml: fetchEmailHtml,
	} = useContext(NotificationFormContext);

	const fetchHtml = useCallback(async () => {
		if (!fetchedArticleId) {
			return `<div>no article loaded</div>`;
		}
		return fetchEmailHtml(fetchedArticleId, {});
	}, [fetchedArticleId, fetchEmailHtml]);

	return (
		<HtmlPreviewLoader
			fetchHtml={fetchHtml}
			title={
				<Typography variant="labelFormMd">Newsletter email preview</Typography>
			}
			widthOptions={[]}
			defaultWidth={400}
		/>
	);
};

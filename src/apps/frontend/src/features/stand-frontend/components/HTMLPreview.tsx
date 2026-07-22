import { HtmlPreviewLoader } from '@guardian/stand/HtmlPreviewLoader';
import { Typography } from '@guardian/stand/Typography';

const fetchHtml = () => Promise.resolve(`<div>Preview content</div>`);

export const HTMLPreview = () => (
	<HtmlPreviewLoader
		fetchHtml={fetchHtml}
		title={
			<Typography variant="labelFormMd">Newsletter email preview</Typography>
		}
		widthOptions={[]}
		defaultWidth={400}
	/>
);

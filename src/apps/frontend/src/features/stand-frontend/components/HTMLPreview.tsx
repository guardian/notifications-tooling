import { HtmlPreviewLoader } from '@guardian/stand/HtmlPreviewLoader';

const fetchHtml = () =>
	Promise.resolve(
		`<div>Preview content</div>`,
	);


export const HTMLPreview = () => (
	<HtmlPreviewLoader
		fetchHtml={fetchHtml}
		title="Newsletter email preview"
		widthOptions={[]}
		defaultWidth={400}
	/>
);

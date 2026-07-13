/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

// Guardian design-system global styles: reset, fonts and design tokens.
import '@guardian/stand/util/reset.css';
import '@guardian/stand/fonts/OpenSans.css';
import '@guardian/stand/fonts/MaterialSymbolsOutlined.css';
import '@guardian/stand/semantic/colors.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const elem = document.getElementById('root');
if (!elem) {
	throw new Error('Root element "#root" was not found in the document');
}

const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
// `import.meta.hot` is typed as always present but is `undefined` in production
// builds, so this runtime guard is intentional.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- guard needed at runtime
if (import.meta.hot) {
	const data = import.meta.hot.data as {
		root?: ReturnType<typeof createRoot>;
	};
	data.root ??= createRoot(elem);
	data.root.render(app);
} else {
	createRoot(elem).render(app);
}

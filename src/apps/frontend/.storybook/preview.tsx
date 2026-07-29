import '@guardian/stand/util/reset.css';
import '@guardian/stand/fonts/OpenSans.css';
import '@guardian/stand/fonts/MaterialSymbolsOutlined.css';
import '@guardian/stand/semantic/colors.css';
import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mswLoader } from 'msw-storybook-addon/csf3';
import '../src/index.css';
import { handlers } from '../src/mocks/handlers';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		msw: { handlers },
	},
	// v3's `mswLoader` is a factory, and only the `csf3` entrypoint reads
	// `parameters.msw` — the `addonMsw()` preview-annotation path ignores it.
	// These stories are CSF 3, so csf3 is the right target. Its `defaultSetup`
	// starts the worker (served from public/, see main.ts `staticDirs`) and
	// filters asset requests itself, which is why there is no `initialize` call
	// and no `onUnhandledRequest` here.
	loaders: [mswLoader()],
	decorators: [
		(Story) => {
			// A fresh QueryClient per story avoids cache bleed between stories.
			const queryClient = new QueryClient();
			return (
				<QueryClientProvider client={queryClient}>
					<Story />
				</QueryClientProvider>
			);
		},
	],
};

export default preview;

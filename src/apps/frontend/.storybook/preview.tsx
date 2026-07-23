import '@guardian/stand/util/reset.css';
import '@guardian/stand/fonts/OpenSans.css';
import '@guardian/stand/fonts/MaterialSymbolsOutlined.css';
import '@guardian/stand/semantic/colors.css';
import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '../src/index.css';
import { handlers } from '../src/mocks/handlers';

// Serves public/mockServiceWorker.js (see .storybook/main.ts `staticDirs`).
initialize({ onUnhandledRequest: 'bypass' });

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
	loaders: [mswLoader],
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

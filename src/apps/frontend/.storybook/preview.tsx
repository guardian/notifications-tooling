import '@guardian/stand/util/reset.css';
import '@guardian/stand/fonts/OpenSans.css';
import '@guardian/stand/fonts/MaterialSymbolsOutlined.css';
import '@guardian/stand/semantic/colors.css';
import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';
import { appRoutes } from '../src/features/stand-frontend/routes';
import { channelHandlers } from '../src/mocks/handlers/channels';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		msw: { handlers: channelHandlers },
	},
	loaders: [mswLoader()],
	decorators: [
		(Story) => {
			// A fresh QueryClient per story avoids cache bleed between stories.
			const queryClient = new QueryClient();
			return (
				<MemoryRouter initialEntries={[appRoutes.createNewsletterEmail]}>
					<QueryClientProvider client={queryClient}>
						<Story />
					</QueryClientProvider>
				</MemoryRouter>
			);
		},
	],
};

export default preview;

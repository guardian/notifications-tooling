import '@guardian/stand/util/reset.css';
import '@guardian/stand/fonts/OpenSans.css';
import '@guardian/stand/fonts/MaterialSymbolsOutlined.css';
import '@guardian/stand/semantic/colors.css';
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
	framework: '@storybook/react-vite',
	core: {
		builder: '@storybook/builder-vite',
	},
	// Serves public/mockServiceWorker.js so stories can use MSW (msw-storybook-addon).
	staticDirs: ['../public'],
};
export default config;

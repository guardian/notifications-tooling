import { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/react-vite';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: ['@storybook/addon-docs'],
	framework: getAbsolutePath('@storybook/react-vite'),
	// Serves public/mockServiceWorker.js so stories can use MSW (msw-storybook-addon).
	staticDirs: ['../public'],
};
export default config;

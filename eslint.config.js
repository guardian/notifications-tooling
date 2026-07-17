// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import guardian from '@guardian/eslint-config';
/** Scope the React ruleset (browser globals, JSX rules) to the frontend only. */
const react = guardian.configs.react.map((config) => ({
	...config,
	files: ['src/apps/frontend/**/*.{js,ts,jsx,mjsx,tsx,mtsx}'],
}));

export default [{
    ignores: [
        '**/dist/**',
        'docker/**',
        '!docker/docker-compose.local.yml',
        '**/*.d.ts',
    ],
}, ...guardian.configs.recommended, ...react, ...storybook.configs["flat/recommended"]];

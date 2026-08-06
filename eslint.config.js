import guardian from '@guardian/eslint-config';
/** Scope the React ruleset (browser globals, JSX rules) to the frontend only. */
const react = guardian.configs.react.map((config) => ({
	...config,
	files: ['src/apps/frontend/**/*.{js,ts,jsx,mjsx,tsx,mtsx}'],
}));

export default [
	{
		ignores: [
			'**/dist/**',
			'cdk/cdk.out/**',
			'**/storybook-static/**',
			'docker/**',
			'!docker/docker-compose.local.yml',
			'**/*.d.ts',
			'**/storybook-static/**',
		],
	},
	...guardian.configs.recommended,
	...react,
	...guardian.configs.storybook,
	{
		// Storybook requires a default export here; @guardian/eslint-config's
		// no-default-export exception only covers .storybook/main.*.
		// vitest.config.* also needs a default export for Vitest to load it.
		files: ['**/.storybook/preview.*', '**/vitest.config.*'],
		rules: {
			'import/no-default-export': 'off',
		},
	},
];

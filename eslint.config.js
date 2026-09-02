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
	{
		// `import/order` derives its `builtin` group from `module.builtinModules`,
		// which lists `bun:*` under Bun but not under Node. The ESLint language
		// server in Zed/VS Code runs on Node, so without this these modules would
		// be grouped differently in the IDE than on the command line.
		settings: {
			'import-x/core-modules': [
				'bun',
				'bun:ffi',
				'bun:jsc',
				'bun:sqlite',
				'bun:test',
				'bun:wrap',
			],
		},
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

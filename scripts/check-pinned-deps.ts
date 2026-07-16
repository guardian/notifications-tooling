#!/usr/bin/env bun
import { Glob } from 'bun';

const DEP_FIELDS = [
	'dependencies',
	'devDependencies',
	'peerDependencies',
	'optionalDependencies',
] as const;

// Matches an exact, fully-pinned semver version, e.g. 1.2.3 or 1.2.3-beta.1
const EXACT_VERSION =
	/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const isPinned = (version: string): boolean => {
	// Allow local workspace and internal protocol references.
	if (
		version.startsWith('workspace:') ||
		version.startsWith('file:') ||
		version.startsWith('link:')
	) {
		return true;
	}
	return EXACT_VERSION.test(version.trim());
};

const glob = new Glob('**/package.json');
const violations: string[] = [];

for await (const path of glob.scan({ cwd: process.cwd() })) {
	if (path.includes('node_modules')) continue;

	const pkg = (await Bun.file(path).json()) as Record<
		string,
		Record<string, string> | undefined
	>;

	for (const field of DEP_FIELDS) {
		const deps = pkg[field];
		if (!deps) continue;

		for (const [name, version] of Object.entries(deps)) {
			if (!isPinned(version)) {
				violations.push(`  ${path} → ${field}.${name}: "${version}"`);
			}
		}
	}
}

if (violations.length > 0) {
	console.error('✖ Unpinned dependency versions found:');
	console.error(violations.join('\n'));
	console.error(
		'\nPin every dependency to an exact version (no ^, ~, *, ranges).',
	);
	process.exit(1);
}

console.log('✔ All dependency versions are pinned.');

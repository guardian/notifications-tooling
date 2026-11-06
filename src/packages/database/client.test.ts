import { afterEach, beforeEach, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmdirSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const packageDir = new URL('.', import.meta.url).pathname;
const bundleName = 'eu-west-1-bundle.pem';
let taskRoot: string;

beforeEach(() => {
	taskRoot = mkdtempSync(join(tmpdir(), 'dispatch-client-test-'));
	mkdirSync(join(taskRoot, 'certificates'));
});

afterEach(() => {
	rmSync(join(taskRoot, 'certificates', bundleName), { force: true });
	rmdirSync(join(taskRoot, 'certificates'));
	rmdirSync(taskRoot);
});

// Isolate module mocks and the cached pool from other database tests.
const runClient = (lambdaTaskRoot: string) =>
	spawnSync(
		process.execPath,
		[
			'-e',
			`
				import { mock } from 'bun:test';
				let configCalls = 0;
				mock.module('./runtime-connection-string', () => ({
					getRuntimeConnectionString: async () => {
						configCalls++;
						return 'postgresql://test:test@database.example.com:5432/test';
					},
				}));
				const { getDb } = await import('./client');
				const [first, second] = await Promise.all([getDb(), getDb()]);
				console.log(JSON.stringify({
					ssl: first.$client.options.ssl,
					connectionString: first.$client.options.connectionString,
					sameDb: first === second,
					configCalls,
				}));
				await first.$client.end();
			`,
		],
		{
			cwd: packageDir,
			env: { ...process.env, LAMBDA_TASK_ROOT: lambdaTaskRoot },
			encoding: 'utf8',
		},
	);

it('loads the deployed CA bundle and requires verification in Lambda', () => {
	const sourceBundle = join(packageDir, 'certificates', bundleName);
	copyFileSync(sourceBundle, join(taskRoot, 'certificates', bundleName));

	const result = runClient(taskRoot);

	expect(result.status).toBe(0);
	expect(JSON.parse(result.stdout)).toEqual({
		ssl: {
			ca: readFileSync(sourceBundle, 'utf8'),
			rejectUnauthorized: true,
		},
		connectionString: 'postgresql://test:test@database.example.com:5432/test',
		sameDb: true,
		configCalls: 1,
	});
});

it('preserves local connections without requiring a CA bundle', () => {
	const result = runClient('');

	expect(result.status).toBe(0);
	expect(JSON.parse(result.stdout)).toEqual({
		ssl: false,
		connectionString: 'postgresql://test:test@database.example.com:5432/test',
		sameDb: true,
		configCalls: 1,
	});
});

it('fails explicitly if the deployed CA bundle is missing', () => {
	const result = runClient(taskRoot);

	expect(result.status).not.toBe(0);
	expect(result.stderr).toContain('ENOENT');
	expect(result.stderr).toContain(bundleName);
});

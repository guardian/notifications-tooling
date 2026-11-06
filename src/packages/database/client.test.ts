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
const sourceBundle = join(packageDir, 'certificates', bundleName);
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
	spawnSync(process.execPath, ['run', 'test-helpers/inspect-client.ts'], {
		cwd: packageDir,
		env: { ...process.env, LAMBDA_TASK_ROOT: lambdaTaskRoot },
		encoding: 'utf8',
	});

it('loads the deployed CA bundle and requires verification in Lambda', () => {
	copyFileSync(sourceBundle, join(taskRoot, 'certificates', bundleName));

	const result = runClient(taskRoot);

	expect(result.stderr).toBe('');
	expect(result.status).toBe(0);
	expect(JSON.parse(result.stdout)).toMatchObject({
		ssl: {
			ca: readFileSync(sourceBundle, 'utf8'),
			rejectUnauthorized: true,
		},
	});
});

it('preserves local connections without requiring a CA bundle', () => {
	const result = runClient('');

	expect(result.stderr).toBe('');
	expect(result.status).toBe(0);
	expect(JSON.parse(result.stdout)).toMatchObject({ ssl: false });
});

it('reuses the database instance and loads connection configuration once', () => {
	const result = runClient('');

	expect(result.stderr).toBe('');
	expect(result.status).toBe(0);
	expect(JSON.parse(result.stdout)).toMatchObject({
		sameDb: true,
		connectionConfigCalls: 1,
		connectionString: 'postgresql://database.example.com:5432/test',
	});
});

it('fails explicitly if the deployed CA bundle is missing', () => {
	const result = runClient(taskRoot);

	expect(result.status).not.toBe(0);
	expect(result.stderr).toContain('ENOENT');
	expect(result.stderr).toContain(bundleName);
});

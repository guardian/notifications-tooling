#!/usr/bin/env bun

import { parseManagedDatabaseSecret } from '../../../managed-database-secret';
import {
	getDatabaseSecretString,
	getMigrationHostInstanceId,
} from './helpers/aws';
import type { Config } from './helpers/cli-args';
import { parseArgs } from './helpers/cli-args';

export {};

const usage = `Usage: bun run db:migration:tunnel --stage <CODE|PROD> [--local-port <port>]\n\nExample:\n  bun run db:migration:tunnel --stage CODE\n`;

const getDatabaseHost = (config: Config) => {
	const secretString = getDatabaseSecretString(config);
	return parseManagedDatabaseSecret(JSON.parse(secretString)).host;
};

const config = parseArgs(usage);
const instanceId = getMigrationHostInstanceId(config);
const databaseHost = getDatabaseHost(config);

console.log(
	`Opening tunnel for ${config.stage} on localhost:${config.localPort} via ${instanceId}`,
);

const sessionProcess = Bun.spawn({
	cmd: [
		'aws',
		'ssm',
		'start-session',
		'--profile',
		config.profile,
		'--region',
		config.region,
		'--target',
		instanceId,
		'--document-name',
		'AWS-StartPortForwardingSessionToRemoteHost',
		'--parameters',
		`host=${databaseHost},portNumber=5432,localPortNumber=${config.localPort}`,
	],
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit',
	env: process.env,
});

process.exit(await sessionProcess.exited);

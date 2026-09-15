#!/usr/bin/env bun

import { parseManagedDatabaseSecret } from '../../../managed-database-secret';
import {
	getCurrentSessionOwnerArn,
	getDatabaseSecretString,
	getLatestActivePortForwardSessionId,
	getMigrationHostInstanceId,
	spawnAws,
	terminateSession,
} from './helpers/aws';
import type { RemoteMigrationConfig } from './helpers/cli-args';
import { parseArgs } from './helpers/cli-args';

export {};

const usage = `Usage: bun run db:migration:tunnel --stage <CODE|PROD> [--local-port <port>]\n\nExample:\n  bun run db:migration:tunnel --stage CODE\n`;

const getDatabaseHost = (config: RemoteMigrationConfig) => {
	const secretString = getDatabaseSecretString(config);
	return parseManagedDatabaseSecret(JSON.parse(secretString)).host;
};

const config = parseArgs(usage);
const instanceId = getMigrationHostInstanceId(config);
const databaseHost = getDatabaseHost(config);
const ownerArn = getCurrentSessionOwnerArn(config);

console.log(
	`Opening tunnel for ${config.stage} on localhost:${config.localPort} via ${instanceId}`,
);

const sessionProcess = spawnAws(
	[
		'ssm',
		'start-session',
		'--target',
		instanceId,
		'--document-name',
		'AWS-StartPortForwardingSessionToRemoteHost',
		'--parameters',
		`host=${databaseHost},portNumber=5432,localPortNumber=${config.localPort}`,
	],
	config,
);

let stoppingTunnel = false;

const stopTunnel = () => {
	if (stoppingTunnel) {
		return;
	}

	stoppingTunnel = true;

	try {
		const sessionId = getLatestActivePortForwardSessionId(
			config,
			instanceId,
			ownerArn,
		);

		terminateSession(config, sessionId);
	} catch {
		// Ignore AWS teardown failures for this test path.
	}
};

process.on('SIGINT', () => {
	stopTunnel();
	process.exit(130);
});

process.on('SIGTERM', () => {
	stopTunnel();
	process.exit(143);
});

process.exit(await sessionProcess.exited);

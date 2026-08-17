// AWS CLI helpers for resolving remote database secrets and migration host details.
import { spawnCommand, spawnCommandSync } from '../../../helpers/process';
import type { RemoteMigrationConfig } from './cli-args';

export const runAws = (awsArgs: string[], config: RemoteMigrationConfig) => {
	const processResult = spawnCommandSync({
		cmd: [
			'aws',
			...awsArgs,
			'--profile',
			config.profile,
			'--region',
			config.region,
		],
		stdout: 'pipe',
		stderr: 'pipe',
		env: process.env,
	});

	if (!processResult.stderr) {
		throw new Error('AWS command failed without stderr output.');
	}

	if (processResult.exitCode !== 0) {
		throw new Error(processResult.stderr.toString().trim());
	}

	if (!processResult.stdout) {
		throw new Error('AWS command completed without stdout output.');
	}

	return processResult.stdout.toString().trim();
};

export const spawnAws = (awsArgs: string[], config: RemoteMigrationConfig) => {
	return spawnCommand({
		cmd: [
			'aws',
			...awsArgs,
			'--profile',
			config.profile,
			'--region',
			config.region,
		],
		env: process.env,
	});
};

export const getDatabaseSecretString = (config: RemoteMigrationConfig) =>
	runAws(
		[
			'secretsmanager',
			'get-secret-value',
			'--secret-id',
			`/${config.stage}/notifications/dispatch/db`,
			'--query',
			'SecretString',
			'--output',
			'text',
		],
		config,
	);

export const getMigrationHostInstanceId = (config: RemoteMigrationConfig) => {
	const instanceId = runAws(
		[
			'cloudformation',
			'describe-stacks',
			'--stack-name',
			config.stackName,
			'--query',
			"Stacks[0].Outputs[?OutputKey=='MigrationHostInstanceId'].OutputValue | [0]",
			'--output',
			'text',
		],
		config,
	);

	if (!instanceId || instanceId === 'None') {
		throw new Error(
			`Could not resolve MigrationHostInstanceId from stack ${config.stackName}.`,
		);
	}

	return instanceId;
};

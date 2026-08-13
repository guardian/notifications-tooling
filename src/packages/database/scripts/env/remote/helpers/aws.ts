// AWS CLI helpers for resolving remote database secrets and migration host details.
import type { Config } from './cli-args';

export const runAws = (awsArgs: string[]) => {
	const processResult = Bun.spawnSync({
		cmd: ['aws', ...awsArgs],
		stdout: 'pipe',
		stderr: 'pipe',
		env: process.env,
	});

	if (processResult.exitCode !== 0) {
		throw new Error(processResult.stderr.toString().trim());
	}

	return processResult.stdout.toString().trim();
};

export const getDatabaseSecretString = (config: Config) =>
	runAws([
		'secretsmanager',
		'get-secret-value',
		'--profile',
		config.profile,
		'--region',
		config.region,
		'--secret-id',
		`/${config.stage}/notifications/dispatch/db`,
		'--query',
		'SecretString',
		'--output',
		'text',
	]);

export const getMigrationHostInstanceId = (config: Config) => {
	const instanceId = runAws([
		'cloudformation',
		'describe-stacks',
		'--profile',
		config.profile,
		'--region',
		config.region,
		'--stack-name',
		config.stackName,
		'--query',
		"Stacks[0].Outputs[?OutputKey=='MigrationHostInstanceId'].OutputValue | [0]",
		'--output',
		'text',
	]);

	if (!instanceId || instanceId === 'None') {
		throw new Error(
			`Could not resolve MigrationHostInstanceId from stack ${config.stackName}.`,
		);
	}

	return instanceId;
};

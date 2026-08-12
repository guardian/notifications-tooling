#!/usr/bin/env bun

export {};

type Stage = 'CODE' | 'PROD';

type TunnelConfig = {
	stage: Stage;
	localPort: string;
	region: string;
	stackName: string;
	profile: string;
};

const usage = `Usage: bun run db:migration:tunnel --stage <CODE|PROD> \n\nExample:\n  bun run db:migration:tunnel --stage CODE\n`;

const parseArgs = (): TunnelConfig => {
	const args = Bun.argv.slice(1);
	let stage: Stage | undefined;
	const localPort = '6543';

	const profile = 'composer';
	const region = 'eu-west-1';


	if (args[0] === '--help' || args[0] === '-h') {
		console.log(usage);
		process.exit(0);
	}
	
	if (args.length === 0) {
		throw new Error('Missing required `--stage` argument.');
	}

	if (args.length > 2) {
		throw new Error('Too many arguments provided.');
	}

	if (args.length === 2) {

		if (args[0] !== '--stage') {
			throw new Error('First argument must be `--stage`.');
		}

		if (args[1] !== 'CODE' && args[1] !== 'PROD') {
			throw new Error('`--stage` must be either CODE or PROD.');
		}

		stage = args[1];
	}

	if (!stage) {
		throw new Error('Missing required `--stage` argument.');
	}

	const stackName = `notifications-${stage ?? 'CODE'}-dispatch-stack`;

	return {
		localPort,
		region,
		stackName,
		stage,
		profile,
	};
};

const runAws = (awsArgs: string[]) => {
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

const getInstanceId = (config: TunnelConfig) => {
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

const getDatabaseHost = (config: TunnelConfig) => {
	const secretString = runAws([
		'secretsmanager',
		'get-secret-value',
		'--region',
		config.region,
		'--secret-id',
		`/${config.stage}/notifications/dispatch/db`,
		'--query',
		'SecretString',
		'--output',
		'text',
	]);

	const secret = JSON.parse(secretString) as { host?: string };

	if (!secret.host) {
		throw new Error('Database secret did not contain a host field.');
	}

	return secret.host;
};

const config = parseArgs();
const instanceId = getInstanceId(config);
const databaseHost = getDatabaseHost(config);

console.log(
	`Opening tunnel for ${config.stage} on localhost:${config.localPort} via ${instanceId}`,
);

const sessionProcess = Bun.spawn({
	cmd: [
		'aws',
		'ssm',
		'start-session',
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

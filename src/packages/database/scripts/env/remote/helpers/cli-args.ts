// CLI argument parsing and derived config for remote database migration scripts.
export type Stage = 'CODE' | 'PROD';
export const LOCAL_PORT = '6543';

export type Config = {
	stage: Stage;
	localPort: string;
	region: string;
	stackName: string;
	profile: string;
};

export const parseArgs = (usage: string): Config => {
	const args = Bun.argv.slice(2);
	let stage: Stage | undefined;
	let localPort = LOCAL_PORT;

	const profile = 'composer';
	const region = 'eu-west-1';

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		const value = args[index + 1];

		if (arg === '--stage' && value) {
			if (value !== 'CODE' && value !== 'PROD') {
				throw new Error('`--stage` must be either CODE or PROD.');
			}

			stage = value;
			index += 1;
			continue;
		}

		if (arg === '--local-port' && value) {
			localPort = value;
			index += 1;
			continue;
		}

		if (arg === '--help' || arg === '-h') {
			console.log(usage);
			process.exit(0);
		}

		throw new Error(`Unknown or incomplete argument: ${arg}`);
	}

	if (!stage) {
		throw new Error('Missing required `--stage` argument.');
	}

	const stackName = `notifications-${stage}-dispatch-stack`;

	return {
		localPort,
		region,
		stackName,
		stage,
		profile,
	};
};

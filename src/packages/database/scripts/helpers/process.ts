type StdioMode = 'inherit' | 'pipe' | 'ignore';

type SpawnCommandOptions = {
	cmd: string[];
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	stdin?: StdioMode;
	stdout?: StdioMode;
	stderr?: StdioMode;
};

export const spawnCommandSync = ({
	cmd,
	stdin = 'inherit',
	stdout = 'inherit',
	stderr = 'inherit',
	cwd,
	env,
}: SpawnCommandOptions): Bun.SyncSubprocess => {
	return Bun.spawnSync(cmd, {
		cwd,
		stdout,
		stderr,
		stdin,
		env: env ?? process.env,
	});
};

export const spawnCommand = ({
	cmd,
	stdin = 'inherit',
	stdout = 'inherit',
	stderr = 'inherit',
	cwd,
	env,
}: SpawnCommandOptions): Bun.Subprocess => {
	return Bun.spawn(cmd, {
		cwd,
		stdout,
		stderr,
		stdin,
		env: env ?? process.env,
	});
};

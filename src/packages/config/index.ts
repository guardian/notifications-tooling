import { env } from './env';

/**
 * `true` when not running in AWS Lambda (which sets `LAMBDA_TASK_ROOT`), i.e.
 * running locally. Used to select local AWS credentials/config.
 */
export const isRunningLocally = !process.env.LAMBDA_TASK_ROOT;

/**
 * The pan-domain settings file for the current stage, held in the
 * `pan-domain-auth-settings` bucket.
 */
export const pandaSettingsFileName = ((): string => {
	switch (env.STAGE) {
		case 'DEV':
			return 'local.dev-gutools.co.uk.settings.public';
		case 'CODE':
			return 'code.dev-gutools.co.uk.settings.public';
		case 'PROD':
			return 'gutools.co.uk.settings.public';
	}
})();

/**
 * The stage whose permissions cache bucket to read. The permissions cache is
 * only published to the CODE and PROD buckets, so DEV reads the CODE cache.
 */
export const permissionsStoreStage = env.STAGE === 'PROD' ? 'PROD' : 'CODE';

export * from './env';
export * from './audiences';
export * from './channels';
export * from './permissions';
export * from './urls';
export * from './user';

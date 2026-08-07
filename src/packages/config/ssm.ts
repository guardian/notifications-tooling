import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { configurationStage, env, localAwsConfig } from './env';

const namespace = `/${configurationStage}/${env.STACK}/${env.APP}/`;

/**
 * The local HTTP port exposed by the AWS Parameters and Secrets Lambda
 * Extension. Defaults to 2773 and can be overridden via the
 * `PARAMETERS_SECRETS_EXTENSION_HTTP_PORT` environment variable.
 */
const extensionPort =
	process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT ?? '2773';

interface GetParameterResponse {
	Parameter?: {
		Value?: string;
	};
}

interface GetSecretValueResponse {
	SecretString?: string;
}

type ManagedConfigSource = 'ssm' | 'secretsManager';

/**
 * Convert an `UPPER_SNAKE_CASE` parameter key into the `kebab-case` form used
 * for parameter names stored in SSM.
 */
const toKebabCase = (key: string): string =>
	key.toLowerCase().replaceAll('_', '-');

const parameterName = (key: string): string =>
	`${namespace}${toKebabCase(key)}`;

const parseSecretString = (secretString: string): unknown => {
	try {
		return JSON.parse(secretString) as unknown;
	} catch {
		return secretString;
	}
};

let localClient: SSMClient | undefined;

const getLocalClient = (): SSMClient => {
	localClient ??= new SSMClient({
		region: localAwsConfig.region,
		credentials: fromIni({ profile: localAwsConfig.profile }),
	});
	return localClient;
};

const getLocalSSMParameter = async (key: string): Promise<string> => {
	const response = await getLocalClient().send(
		new GetParameterCommand({
			Name: parameterName(key),
			WithDecryption: true,
		}),
	);
	const value = response.Parameter?.Value;

	if (!value) {
		throw new Error(`SSM parameter "${key}" has no value.`);
	}

	return value;
};

const getLocalManagedConfigValue = async (key: string): Promise<string> => {
	const override = process.env[key];
	if (override) {
		return override;
	}

	return getLocalSSMParameter(key);
};

const fetchManagedConfigValueFromExtension = async (
	key: string,
	source: ManagedConfigSource,
): Promise<unknown> => {
	const sessionToken = process.env.AWS_SESSION_TOKEN;
	if (!sessionToken) {
		throw new Error(
			'AWS_SESSION_TOKEN is not set; the AWS Parameters and Secrets Lambda Extension is only available in the Lambda runtime.',
		);
	}

	const path =
		source === 'secretsManager'
			? '/secretsmanager/get'
			: '/systemsmanager/parameters/get';

	const url = new URL(`http://localhost:${extensionPort}${path}`);
	url.port = extensionPort;
	const parameterName = source === 'secretsManager' ? 'secretId' : 'name';
	url.searchParams.set(parameterName, `${namespace}${toKebabCase(key)}`);

	if (source === 'ssm') {
		url.searchParams.set('withDecryption', 'true');
	}

	const response = await fetch(url, {
		headers: {
			'X-Aws-Parameters-Secrets-Token': sessionToken,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch SSM parameter "${key}": ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
};

const getSSMParameterValue = async (key: string): Promise<string> => {
	if (env.STAGE === 'DEV') {
		return getLocalManagedConfigValue(key);
	}

	const body = (await fetchManagedConfigValueFromExtension(
		key,
		'ssm',
	)) as GetParameterResponse;

	const value = body.Parameter?.Value;

	if (!value) {
		throw new Error(`SSM parameter "${key}" has no value.`);
	}

	return value;
};

const getSecretsManagerValue = async (key: string): Promise<unknown> => {
	if (env.STAGE === 'DEV') {
		return getLocalManagedConfigValue(key);
	}

	const body = (await fetchManagedConfigValueFromExtension(
		key,
		'secretsManager',
	)) as GetSecretValueResponse;

	const { SecretString } = body;

	if (!SecretString) {
		throw new Error(`Secrets Manager secret "${key}" has no SecretString.`);
	}

	return parseSecretString(SecretString);
};

/**
 * Fetch an SSM parameter value. DEV uses an environment override when present,
 * otherwise it reads the CODE parameter directly using the Composer profile.
 * Deployed stages use the AWS Parameters and Secrets Lambda Extension.
 *
 * The extension runs a local HTTP server (default port 2773) that caches
 * parameter values, avoiding a direct call to SSM on every invocation. The
 * `key` argument is resolved relative to this app's parameter namespace.
 *
 * @param key The parameter name, relative to the app namespace.
 * @source The source of the parameter value, either SSM or Secrets Manager.
 * @returns The decrypted parameter value.
 */

export const getManagedConfigValue = async (
	key: string,
	source: ManagedConfigSource = 'ssm',
): Promise<unknown> => {
	return source === 'secretsManager'
		? getSecretsManagerValue(key)
		: getSSMParameterValue(key);
};

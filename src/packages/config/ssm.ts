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

const fetchExtensionResponse = async (
	key: string,
	url: URL,
): Promise<unknown> => {
	const sessionToken = process.env.AWS_SESSION_TOKEN;
	if (!sessionToken) {
		throw new Error(
			'AWS_SESSION_TOKEN is not set; the AWS Parameters and Secrets Lambda Extension is only available in the Lambda runtime.',
		);
	}

	const response = await fetch(url, {
		headers: {
			'X-Aws-Parameters-Secrets-Token': sessionToken,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch config value for key: "${key}": ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
};

const fetchSSMParameterFromExtension = async (
	key: string,
): Promise<GetParameterResponse> => {
	const url = new URL(
		`http://localhost:${extensionPort}/systemsmanager/parameters/get`,
	);
	url.port = extensionPort;
	url.searchParams.set('name', `${namespace}${toKebabCase(key)}`);
	url.searchParams.set('withDecryption', 'true');

	return fetchExtensionResponse(key, url) as Promise<GetParameterResponse>;
};

const fetchSecretValueFromExtension = async (
	key: string,
): Promise<GetSecretValueResponse> => {
	const url = new URL(`http://localhost:${extensionPort}/secretsmanager/get`);
	url.port = extensionPort;
	url.searchParams.set('secretId', `${namespace}${toKebabCase(key)}`);

	return fetchExtensionResponse(key, url) as Promise<GetSecretValueResponse>;
};

/**
 * Fetch a decrypted SSM parameter from this app's namespace.
 *
 * In deployed stages it calls the AWS Parameters and Secrets Lambda
 * Extension running on localhost.
 */
export const getSSMParameter = async (key: string): Promise<string> => {
	if (env.STAGE === 'DEV') {
		return getLocalManagedConfigValue(key);
	}

	const body = await fetchSSMParameterFromExtension(key);

	const value = body.Parameter?.Value;

	if (!value) {
		throw new Error(`SSM parameter "${key}" has no value.`);
	}

	return value;
};

/**
 * Fetch a secret from this app's namespace and parse it into the caller's
 * expected shape.
 *
 * In DEV this first checks for a matching environment-variable override and
 * otherwise reads the CODE value directly using the local Composer AWS profile.
 * In deployed stages it calls the AWS Parameters and Secrets Lambda Extension
 * running on localhost. The returned secret string is JSON-parsed when
 * possible, then passed to `parse` so the caller can validate and narrow it.
 */
export const getSecretValue = async <T>(
	key: string,
	parse: (value: unknown) => T,
): Promise<T> => {
	if (env.STAGE === 'DEV') {
		return parse(parseSecretString(await getLocalManagedConfigValue(key)));
	}

	const body = await fetchSecretValueFromExtension(key);

	const { SecretString } = body;

	if (!SecretString) {
		throw new Error(`Secrets Manager secret "${key}" has no SecretString.`);
	}

	return parse(parseSecretString(SecretString));
};

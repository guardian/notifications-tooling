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
	Parameter: {
		Value: string;
	};
}

/**
 * Convert an `UPPER_SNAKE_CASE` parameter key into the `kebab-case` form used
 * for parameter names stored in SSM.
 */
const toKebabCase = (key: string): string =>
	key.toLowerCase().replaceAll('_', '-');

const parameterName = (key: string): string =>
	`${namespace}${toKebabCase(key)}`;

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
 * @returns The decrypted parameter value.
 */
export const getSSMParameter = async (key: string): Promise<string> => {
	if (env.STAGE === 'DEV') {
		const override = process.env[key];
		if (override) {
			return override;
		}

		return getLocalSSMParameter(key);
	}

	const sessionToken = process.env.AWS_SESSION_TOKEN;
	if (!sessionToken) {
		throw new Error(
			'AWS_SESSION_TOKEN is not set; the AWS Parameters and Secrets Lambda Extension is only available in the Lambda runtime.',
		);
	}

	const path = secretManager
		? '/secretsmanager/get'
		: '/systemsmanager/parameters/get';

	const url = new URL(`http://localhost:${extensionPort}${path}`);
	url.port = extensionPort;
	// SSM parameters are stored in kebab-case, but callers pass the
	// UPPER_SNAKE_CASE env-var key, so convert it to match the stored name.
	url.searchParams.set('name', parameterName(key));
	url.searchParams.set('withDecryption', 'true');

	const response = await fetch(url, {
		headers: {
			'X-Aws-Parameters-Secrets-Token': sessionToken,
		},
	});

	console.log(response);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch SSM parameter "${key}": ${response.status} ${response.statusText}`,
		);
	}

	const { Parameter } = (await response.json()) as GetParameterResponse;
	return Parameter.Value;
};

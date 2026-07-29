import { env } from './env';

const namespace = `/${env.STAGE}/${env.STACK}/${env.APP}/`;

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
 * Fetch an SSM parameter value via the AWS Parameters and Secrets Lambda
 * Extension.
 *
 * The extension runs a local HTTP server (default port 2773) that caches
 * parameter values, avoiding a direct call to SSM on every invocation. The
 * `name` argument is resolved relative to this app's parameter namespace.
 *
 * @param key The parameter name, relative to the app namespace.
 * @returns The decrypted parameter value.
 */
export const getSSMParameter = async (key: string): Promise<string> => {
	if (env.STAGE === 'DEV') {
		const value = process.env[`${key}`];

		if (!value) {
			throw new Error(`SSM parameter "${key}" is not set in DEV environment.`);
		}

		return Promise.resolve(value);
	}

	const sessionToken = process.env.AWS_SESSION_TOKEN;
	if (!sessionToken) {
		throw new Error(
			'AWS_SESSION_TOKEN is not set; the AWS Parameters and Secrets Lambda Extension is only available in the Lambda runtime.',
		);
	}

	const url = new URL('http://localhost:2773/systemsmanager/parameters/get');
	url.port = extensionPort;
	url.searchParams.set('name', `${namespace}${key}`);
	url.searchParams.set('withDecryption', 'true');

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

	const { Parameter } = (await response.json()) as GetParameterResponse;
	return Parameter.Value;
};

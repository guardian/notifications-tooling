import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from 'bun:test';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const baseEnv = { STACK: 'notifications', APP: 'dispatch' };

const importSsmModule = async (stage: string) => {
	await mock.module('./env', () => ({
		configurationStage: stage === 'PROD' ? 'PROD' : 'CODE',
		env: { ...baseEnv, STAGE: stage },
		localAwsConfig: { profile: 'composer', region: 'eu-west-1' },
	}));
	return import('./ssm');
};

const getSSMParameter = async (key: string, stage: string = 'CODE') => {
	const { getSSMParameter } = await importSsmModule(stage);
	return getSSMParameter(key);
};

const getSecretValue = async <T>(
	key: string,
	parse: (value: unknown) => T,
	stage: string = 'CODE',
) => {
	const { getSecretValue } = await importSsmModule(stage);
	return getSecretValue(key, parse);
};

const SESSION_TOKEN = 'test-session-token';

beforeEach(() => {
	process.env.AWS_SESSION_TOKEN = SESSION_TOKEN;
});

afterEach(() => {
	mock.restore();
	delete process.env.AWS_SESSION_TOKEN;
	delete process.env.MY_PARAM;
});

describe('getSSMParameter in production', () => {
	it('fetches the parameter from the extension endpoint and returns its value', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ Parameter: { Value: 'secret-value' } }),
		);

		const EXTENSION_URL =
			'http://localhost:2773/systemsmanager/parameters/get' +
			'?name=%2FCODE%2Fnotifications%2Fdispatch%2Fmy-param&withDecryption=true';

		const value = await getSSMParameter('my-param');

		expect(value).toBe('secret-value');

		const [calledUrl, calledInit] = fetcher.mock.calls[0] ?? [];
		expect((calledUrl as URL).toString()).toEqual(EXTENSION_URL);
		expect(calledInit).toEqual({
			headers: {
				'X-Aws-Parameters-Secrets-Token': SESSION_TOKEN,
			},
		});
	});

	it('decrypts the parameter by requesting withDecryption', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ Parameter: { Value: 'secret-value' } }),
		);

		await getSSMParameter('my-param');

		const calledUrl = fetcher.mock.calls[0]?.[0] as URL;
		expect(calledUrl.searchParams.get('withDecryption')).toBe('true');
	});

	it('converts an UPPER_SNAKE_CASE key to kebab-case in the parameter name', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ Parameter: { Value: 'secret-value' } }),
		);

		await getSSMParameter('BRAZE_API_KEY');

		const calledUrl = fetcher.mock.calls[0]?.[0] as URL;
		expect(calledUrl.searchParams.get('name')).toBe(
			'/CODE/notifications/dispatch/braze-api-key',
		);
	});

	it('throws when AWS_SESSION_TOKEN is not present', () => {
		const fetcher = spyOn(globalThis, 'fetch');
		delete process.env.AWS_SESSION_TOKEN;

		expect(getSSMParameter('my-param')).rejects.toThrow(
			'AWS_SESSION_TOKEN is not set',
		);

		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws when the extension responds with a non-ok status', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('Not Found', { status: 404, statusText: 'Not Found' }),
		);

		return expect(getSSMParameter('my-param')).rejects.toThrow(
			'Failed to fetch config value for key: "my-param": 404 Not Found',
		);
	});
});

describe('getSecretValue in production', () => {
	it('fetches Secrets Manager secrets via the extension and parses SecretString JSON', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				SecretString:
					'{"host":"db.example","port":5432,"dbname":"dispatchdb","username":"dispatch","password":"secret"}',
			}),
		);

		const secret = await getSecretValue('db', (value) => value, 'CODE');

		expect(secret).toEqual({
			host: 'db.example',
			port: 5432,
			dbname: 'dispatchdb',
			username: 'dispatch',
			password: 'secret',
		});

		const calledUrl = fetcher.mock.calls[0]?.[0] as URL;
		expect(calledUrl.toString()).toEqual(
			'http://localhost:2773/secretsmanager/get' +
				'?secretId=%2FCODE%2Fnotifications%2Fdispatch%2Fdb',
		);
		expect(calledUrl.searchParams.get('withDecryption')).toBeNull();
	});
});

describe('getSSMParameter in DEV', () => {
	it('returns a process.env override without calling SSM', async () => {
		process.env.MY_PARAM = 'local-value';
		const fetcher = spyOn(globalThis, 'fetch');
		const send = spyOn(SSMClient.prototype, 'send');

		const value = await getSSMParameter('MY_PARAM', 'DEV');

		expect(value).toBe('local-value');
		expect(fetcher).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it('fetches CODE parameters directly from SSM when no override is set', async () => {
		delete process.env.MY_PARAM;
		const fetcher = spyOn(globalThis, 'fetch');
		const send = spyOn(SSMClient.prototype, 'send').mockResolvedValue({
			Parameter: { Value: 'code-value' },
		} as never);

		const value = await getSSMParameter('MY_PARAM', 'DEV');

		expect(value).toBe('code-value');
		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0]?.[0]).toBeInstanceOf(GetParameterCommand);
		expect((send.mock.calls[0]?.[0] as GetParameterCommand).input).toEqual({
			Name: '/CODE/notifications/dispatch/my-param',
			WithDecryption: true,
		});
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws when SSM returns no parameter value', () => {
		delete process.env.MY_PARAM;
		spyOn(SSMClient.prototype, 'send').mockResolvedValue({
			Parameter: {},
		} as never);

		return expect(getSSMParameter('MY_PARAM', 'DEV')).rejects.toThrow(
			'SSM parameter "MY_PARAM" has no value.',
		);
	});
});

describe('getSecretValue in DEV', () => {
	it('parses a local secret value before returning it', async () => {
		process.env.DB = '{"host":"db.example","port":5432}';

		const value = await getSecretValue(
			'DB',
			(raw) => raw as { host: string; port: number },
			'DEV',
		);

		expect(value).toEqual({ host: 'db.example', port: 5432 });
	});
});

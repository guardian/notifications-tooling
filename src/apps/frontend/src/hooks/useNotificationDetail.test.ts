import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	mock,
} from 'bun:test';
import { ApiError } from '../api-client/errors';
import { fetchNotificationDetail } from './useNotificationDetail';

const originalFetch = globalThis.fetch;
const originalLocation = Object.getOwnPropertyDescriptor(
	globalThis,
	'location',
);

beforeAll(() => {
	Object.defineProperty(globalThis, 'location', {
		configurable: true,
		value: {
			origin: 'http://localhost:3000',
			href: 'http://localhost:3000/history',
		},
	});
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	globalThis.location.href = 'http://localhost:3000/history';
});

afterAll(() => {
	if (originalLocation) {
		Object.defineProperty(globalThis, 'location', originalLocation);
	} else {
		Reflect.deleteProperty(globalThis, 'location');
	}
});

describe('fetchNotificationDetail', () => {
	it('redirects an unauthenticated request to login and preserves the history return URL', async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(
				new Response(
					JSON.stringify({
						error: 'unauthenticated',
						loginUrl: 'https://login.example.com/login',
					}),
					{ status: 401, headers: { 'content-type': 'application/json' } },
				),
			),
		) as unknown as typeof fetch;

		let requestError: unknown;
		try {
			await fetchNotificationDetail('notification-123');
		} catch (error) {
			requestError = error;
		}

		expect(requestError).toBeInstanceOf(ApiError);
		expect(requestError).toMatchObject({ failure: 'unauthenticated' });
		expect(globalThis.location.href).toBe(
			'https://login.example.com/login?returnUrl=http%3A%2F%2Flocalhost%3A3000%2Fhistory',
		);
	});
});

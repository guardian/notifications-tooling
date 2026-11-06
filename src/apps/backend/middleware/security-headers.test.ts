import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { Request, Response } from 'express';
import { securityHeaders } from './security-headers';

const mockNextFunction = mock(() => undefined);

const createMockResponse = () => {
	const headers = new Map<string, string>();
	const locals: Record<string, unknown> = {};
	return {
		headers,
		locals,
		response: {
			locals,
			setHeader: (name: string, value: string) => headers.set(name, value),
		} as unknown as Response,
	};
};

const run = () => {
	const { headers, locals, response } = createMockResponse();
	securityHeaders({} as Request, response, mockNextFunction);
	return { headers, locals };
};

describe('securityHeaders', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
	});

	it('calls next', () => {
		run();
		expect(mockNextFunction).toHaveBeenCalledTimes(1);
	});

	it('sets a per-request CSP nonce on res.locals and in script-src', () => {
		const { headers, locals } = run();

		const nonce = locals.cspNonce as string;
		expect(nonce).toBeTruthy();
		expect(headers.get('Content-Security-Policy')).toContain(
			`script-src 'self' 'nonce-${nonce}'`,
		);
	});

	it('issues a different nonce per request', () => {
		expect(run().locals.cspNonce as string).not.toBe(
			run().locals.cspNonce as string,
		);
	});

	it('locks down the dangerous CSP directives', () => {
		const csp = run().headers.get('Content-Security-Policy') ?? '';
		const scriptSrc = csp
			.split('; ')
			.find((directive) => directive.startsWith('script-src '));
		expect(csp).toContain(`object-src 'none'`);
		expect(csp).toContain(`base-uri 'self'`);
		expect(csp).toContain(`frame-ancestors 'none'`);
		expect(scriptSrc).not.toContain(`'unsafe-inline'`);
		expect(scriptSrc).not.toContain(`'unsafe-eval'`);
	});

	it('sets the supporting security headers', () => {
		const { headers } = run();
		expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(headers.get('Referrer-Policy')).toBe(
			'strict-origin-when-cross-origin',
		);
		expect(headers.get('X-Frame-Options')).toBe('DENY');
		expect(headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
	});
});

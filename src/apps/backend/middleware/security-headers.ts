import { randomBytes } from 'node:crypto';
import { env } from 'config';
import type { NextFunction, Request, Response } from 'express';

/**
 * Builds the Content-Security-Policy. `script-src` is strict — only same-origin
 * bundles and the per-request nonce run, which blocks injected inline scripts
 * AND inline event handlers (`onerror=`, `onclick=`), the core same-origin XSS
 * defence. Passive resource directives stay permissive so the Guardian design
 * system (emotion runtime styles, CDN fonts/images) and client telemetry keep
 * working; with script execution locked down they are not an XSS vector.
 */
const buildContentSecurityPolicy = (nonce: string): string =>
	[
		`default-src 'self'`,
		`base-uri 'self'`,
		`object-src 'none'`,
		`frame-ancestors 'none'`,
		`form-action 'self'`,
		`script-src 'self' 'nonce-${nonce}'`,
		`style-src 'self' 'unsafe-inline'`,
		`img-src 'self' data: blob: https:`,
		`font-src 'self' data: https:`,
		`connect-src 'self' https:`,
		`frame-src 'self'`,
	].join('; ');

/**
 * Sets the response security headers and exposes the CSP nonce on
 * `res.locals.cspNonce` so `serveIndex` can stamp it onto the inline bootstrap
 * script. Applied globally; the headers are harmless on API/asset responses and
 * protective on the SPA document.
 */
export const securityHeaders = (
	_request: Request,
	response: Response,
	next: NextFunction,
) => {
	const nonce = randomBytes(16).toString('base64');
	response.locals.cspNonce = nonce;

	response.setHeader(
		'Content-Security-Policy',
		buildContentSecurityPolicy(nonce),
	);
	response.setHeader('X-Content-Type-Options', 'nosniff');
	response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.setHeader('X-Frame-Options', 'DENY');
	response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

	// HSTS only in deployed stages, which are always served over HTTPS.
	if (env.STAGE !== 'DEV') {
		response.setHeader(
			'Strict-Transport-Security',
			'max-age=63072000; includeSubDomains',
		);
	}

	next();
};

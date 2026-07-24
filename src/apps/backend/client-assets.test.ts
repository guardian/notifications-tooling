import { describe, expect, it } from 'bun:test';
import { isClientAppRoutePath } from './client-assets';

describe('isClientAppRoutePath', () => {
	it('returns true for browser entrypoint routes', () => {
		expect(isClientAppRoutePath('/')).toBe(true);
		expect(isClientAppRoutePath('/compose/drafts')).toBe(true);
	});

	it('returns false for static asset paths', () => {
		expect(isClientAppRoutePath('/index-avppv383.js')).toBe(false);
		expect(isClientAppRoutePath('/styles/app.css')).toBe(false);
	});
});

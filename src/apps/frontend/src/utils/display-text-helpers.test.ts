import { describe, expect, it } from 'bun:test';
import {
	getSenderDisplayName,
	getSenderInitials,
} from './display-text-helpers';

describe('sender display text', () => {
	it('formats sender names from common email separators', () => {
		expect(getSenderDisplayName('joshua.anderson@guardian.co.uk')).toBe(
			'Joshua Anderson',
		);
		expect(getSenderDisplayName('CLAIRE_phipps-test@guardian.co.uk')).toBe(
			'Claire Phipps Test',
		);
	});

	it('returns at most two uppercase initials', () => {
		expect(getSenderInitials('joshua.anderson@guardian.co.uk')).toBe('JA');
		expect(getSenderInitials('CLAIRE_phipps-test@guardian.co.uk')).toBe('CP');
	});
});

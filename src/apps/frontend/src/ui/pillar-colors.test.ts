import { describe, expect, it } from 'bun:test';
import { getPillarColor } from './pillar-colors';

describe('getPillarColor', () => {
	it('returns the news pillar colour', () => {
		expect(getPillarColor('pillar/news')).toBe('#C70000');
	});

	it('returns the opinion pillar colour', () => {
		expect(getPillarColor('pillar/opinion')).toBe('#E05E00');
	});

	it('returns the sport pillar colour', () => {
		expect(getPillarColor('pillar/sport')).toBe('#0084C6');
	});

	it('returns the lifestyle pillar colour', () => {
		expect(getPillarColor('pillar/lifestyle')).toBe('#BB3B80');
	});

	it('returns the arts (culture) pillar colour', () => {
		expect(getPillarColor('pillar/arts')).toBe('#A1845C');
	});

	it('falls back to the default colour for an unrecognised pillar', () => {
		expect(getPillarColor('pillar/unknown')).not.toBeUndefined();
	});

	it('falls back to the default colour when there is no pillar', () => {
		expect(getPillarColor(undefined)).not.toBeUndefined();
	});
});

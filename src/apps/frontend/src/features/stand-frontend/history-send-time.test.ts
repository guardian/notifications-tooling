import { describe, expect, it } from 'bun:test';
import { formatHistorySendTime } from './history-send-time';

const NOW = new Date('2026-08-27T12:00:00Z');
const ago = (milliseconds: number) =>
    new Date(NOW.getTime() - milliseconds).toISOString();

describe('formatHistorySendTime', () => {
    it('uses whole seconds for times less than a minute ago', () => {
        expect(formatHistorySendTime(ago(42_900), NOW)).toEqual({
            label: '42 secs ago',
            isRecent: true,
        });
    });

    it('uses only whole minutes for times less than an hour ago', () => {
        expect(formatHistorySendTime(ago(12 * 60_000 + 45_000), NOW)).toEqual({
            label: '12 mins ago',
            isRecent: true,
        });
    });

    it('uses only whole hours for times less than 24 hours ago', () => {
        expect(formatHistorySendTime(ago(5 * 3_600_000 + 59 * 60_000), NOW)).toEqual(
            {
                label: '5 hours ago',
                isRecent: true,
            },
        );
    });

    it('uses an absolute, non-bold time at exactly 24 hours', () => {
        const result = formatHistorySendTime(ago(24 * 3_600_000), NOW);

        expect(result.isRecent).toBe(false);
        expect(result.label).not.toContain('ago');
    });

    it('preserves an invalid timestamp without marking it as recent', () => {
        expect(formatHistorySendTime('not-a-date', NOW)).toEqual({
            label: 'not-a-date',
            isRecent: false,
        });
    });
});
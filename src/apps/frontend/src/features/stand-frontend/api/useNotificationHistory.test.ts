import { describe, expect, it } from 'bun:test';
import {
    getNotificationHistoryQueryKey,
    notificationHistoryQueryKey,
} from './useNotificationHistory';

describe('notification history query keys', () => {
    it('separates pages and date windows in the cache', () => {
        expect(
            getNotificationHistoryQueryKey({
                limit: 20,
                offset: 20,
                since: 1_700_000_000,
            }),
        ).toEqual([
            ...notificationHistoryQueryKey,
            { limit: 20, offset: 20, since: 1_700_000_000 },
        ]);
    });
});
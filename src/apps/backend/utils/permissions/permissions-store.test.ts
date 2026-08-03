import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { UserPermissions } from '@config';
import type * as PermissionsStore from './permissions-store';

// Back the store with a controllable mock so no real S3 client is built and we
// can drive what the underlying permissions cache returns.
const storeListUserPermissions = mock<(userId: string) => Promise<string[]>>(
	() => Promise.resolve([]),
);
const init = mock(() => ({ listUserPermissions: storeListUserPermissions }));

await mock.module('@guardian/permissions-client', () => ({ init }));

// Import through a cache-busting specifier so the global `permissions-store`
// module mock that sibling test files install (via `installPermissionsStoreMock`)
// does not shadow the real implementation we want to exercise here.
const { listUserPermissions } =
	// @ts-expect-error -- cache-busting query specifier has no module declaration
	(await import('./permissions-store.ts?real')) as typeof PermissionsStore;

describe('listUserPermissions', () => {
	beforeEach(() => {
		storeListUserPermissions.mockReset();
		storeListUserPermissions.mockResolvedValue([]);
	});

	it('constructs the permissions store lazily on first use, not on import', async () => {
		// Importing the module must not have built the store yet.
		expect(init).not.toHaveBeenCalled();

		await listUserPermissions('ada.lovelace@guardian.co.uk');

		expect(init).toHaveBeenCalledTimes(1);
		expect(init).toHaveBeenCalledWith({
			localProfile: 'composer',
			stage: 'CODE',
			isRunningLocally: true,
		});
	});

	it('reuses the same store across calls, constructing it once', async () => {
		await listUserPermissions('ada.lovelace@guardian.co.uk');
		await listUserPermissions('charles.babbage@guardian.co.uk');

		expect(init).toHaveBeenCalledTimes(1);
	});

	it('passes the userId through to the store', async () => {
		await listUserPermissions('ada.lovelace@guardian.co.uk');

		expect(storeListUserPermissions).toHaveBeenCalledWith(
			'ada.lovelace@guardian.co.uk',
		);
	});

	it('returns only whitelisted permissions', async () => {
		storeListUserPermissions.mockResolvedValue([
			UserPermissions.DispatchAccess,
			'some_unlisted_permission',
			'another_unlisted_permission',
		]);

		const result = await listUserPermissions('ada.lovelace@guardian.co.uk');

		expect(result).toEqual([UserPermissions.DispatchAccess]);
	});

	it('filters out every non-whitelisted permission', async () => {
		storeListUserPermissions.mockResolvedValue([
			'not_a_real_permission',
			'also_not_real',
		]);

		const result = await listUserPermissions('ada.lovelace@guardian.co.uk');

		expect(result).toEqual([]);
	});

	it('returns an empty array when the store grants nothing', async () => {
		storeListUserPermissions.mockResolvedValue([]);

		const result = await listUserPermissions('ada.lovelace@guardian.co.uk');

		expect(result).toEqual([]);
	});
});

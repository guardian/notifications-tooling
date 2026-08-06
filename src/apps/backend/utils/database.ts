import { getDb } from '@database';
//used just for testing database connection
export async function initialiseDbConnection() {
	const db = await getDb();
	await db.execute('select 1');

	return {
		closeDbConnection: async () => {},
	};
}

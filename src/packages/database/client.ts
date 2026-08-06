import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getConnectionString } from './config-loader';

type Db = ReturnType<typeof drizzle>;

let poolPromise: Promise<Pool> | undefined;
let dbPromise: Promise<Db> | undefined;

const getPool = async (): Promise<Pool> => {
	poolPromise ??= (async () => {
		const connectionString = await getConnectionString();
		return new Pool({ connectionString });
	})();

	return poolPromise;
};

export const getDb = async (): Promise<Db> => {
	dbPromise ??= (async () => {
		const pool = await getPool();
		return drizzle({ client: pool });
	})();

	return dbPromise;
};

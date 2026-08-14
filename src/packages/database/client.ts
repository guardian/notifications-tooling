import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getRuntimeConnectionString } from './runtime-connection-string';

type Db = ReturnType<typeof drizzle>;

let poolPromise: Promise<Pool> | undefined;
let dbPromise: Promise<Db> | undefined;

const isRunningInLambda = !!process.env.LAMBDA_TASK_ROOT;

const getPool = async (): Promise<Pool> => {
	poolPromise ??= (async () => {
		const connectionString = await getRuntimeConnectionString();
		return new Pool({
			connectionString,
			ssl: isRunningInLambda
				? {
						rejectUnauthorized: false,
					}
				: false,
		});
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

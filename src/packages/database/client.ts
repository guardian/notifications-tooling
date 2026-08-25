import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getRuntimeConnectionString } from './runtime-connection-string';
import * as schema from './schema';

/** The drizzle client with the schema registered, so `db.query.*` is available. */
export type Database = ReturnType<typeof drizzle<typeof schema>>;

let poolPromise: Promise<Pool> | undefined;
let dbPromise: Promise<Database> | undefined;

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

export const getDb = async (): Promise<Database> => {
	dbPromise ??= (async () => {
		const pool = await getPool();
		return drizzle({ client: pool, schema });
	})();

	return dbPromise;
};

import { Client } from 'pg';

const requiredEnvironmentVariables = [
	'DB_HOST',
	'DB_PORT',
	'DB_NAME',
	'DB_USERNAME',
	'DB_PASSWORD',
	'DB_TEST_NAME',
] as const;

for (const name of requiredEnvironmentVariables) {
	if (!process.env[name]) {
		throw new Error(`${name} must be set to prepare the test database.`);
	}
}

const testDatabaseName = process.env.DB_TEST_NAME!;

if (!testDatabaseName.endsWith('_test')) {
	throw new Error('DB_TEST_NAME must end with _test.');
}

const client = new Client({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
});

await client.connect();

try {
	const existingDatabase = await client.query(
		'select 1 from pg_database where datname = $1',
		[testDatabaseName],
	);

	if (existingDatabase.rowCount === 0) {
		const escapedDatabaseName = testDatabaseName.replaceAll('"', '""');
		await client.query(`create database "${escapedDatabaseName}"`);
		console.log(`Created test database ${testDatabaseName}.`);
	}
} finally {
	await client.end();
}

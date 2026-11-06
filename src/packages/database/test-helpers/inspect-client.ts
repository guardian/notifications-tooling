import { mock } from 'bun:test';

let connectionConfigCalls = 0;

await mock.module('../runtime-connection-string', () => ({
	getRuntimeConnectionString: () => {
		connectionConfigCalls++;
		return Promise.resolve('postgresql://database.example.com:5432/test');
	},
}));

const { getDb } = await import('../client');
const [first, second] = await Promise.all([getDb(), getDb()]);

console.log(
	JSON.stringify({
		ssl: first.$client.options.ssl,
		connectionString: first.$client.options.connectionString,
		sameDb: first === second,
		connectionConfigCalls,
	}),
);

await first.$client.end();

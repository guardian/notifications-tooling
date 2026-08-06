import { mock } from 'bun:test';

export const dbExecuteMock = mock<(query: string) => Promise<void>>(() =>
	Promise.resolve(),
);

const mockedDb = {
	execute: dbExecuteMock,
};

export const installDatabaseMock = (): void => {
	void mock.module('@database', () => ({
		getDb: () => Promise.resolve(mockedDb),
	}));
};

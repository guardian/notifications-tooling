import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
// The frontend hand-writes its own Zod schemas rather than importing backend
// types, so the browser bundle takes no dependency on a server workspace. This
// test is the thing that stops the two copies drifting: it parses a live
// response with the schema the SPA actually ships. Imported by relative path
// because the frontend is not a dependency of the backend, and must not become
// one — nothing outside this file may import across the boundary.
import { channelConstraintsResponseSchema } from '../../../frontend/src/features/stand-frontend/api/schemas';
import {
	authenticateRequests,
	installPandaAuthMock,
} from '../../utils/test-utils/panda-auth';
import type { TestServer } from '../../utils/test-utils/server';

// Stub Panda verification before the app (and its real verifier) is imported.
installPandaAuthMock();
const { startTestServer } = await import('../../utils/test-utils/server');

let server: TestServer;
let baseUrl: string;

beforeAll(async () => {
	authenticateRequests();
	server = await startTestServer();
	baseUrl = server.baseUrl;
});

afterAll(async () => {
	await server.close();
});

/**
 * A failure here reads as contract drift, not as the backend being broken: the
 * endpoint can be perfectly correct and still fail this test, because what it
 * asserts is that the *frontend's* copy of the contract still describes what
 * the backend serves.
 */
describe('GET /v1/channels/constraints contract', () => {
	it('serves a body the frontend schema parses', async () => {
		const response = await fetch(`${baseUrl}/v1/channels/constraints`);

		expect(response.status).toBe(200);

		const result = channelConstraintsResponseSchema.safeParse(
			await response.json(),
		);

		expect(result.error?.issues ?? []).toEqual([]);
		expect(result.success).toBe(true);
	});

	it('serves every limit the SPA renders as a usable number', async () => {
		const response = await fetch(`${baseUrl}/v1/channels/constraints`);
		const parsed = channelConstraintsResponseSchema.parse(
			await response.json(),
		);

		const { subject } = parsed.channels.newsletter.compose;
		const { body } = parsed.channels.newsletter.content;

		// The UI badges `recommended` then `editorialLimit`, so an ordering
		// inversion would render a "Limit Reached" badge before the warning.
		expect(subject.recommended).toBeLessThanOrEqual(subject.editorialLimit);
		expect(body.recommended).toBeLessThanOrEqual(body.editorialLimit);

		// The editor is deliberately allowed to type past `editorialLimit`, so a
		// cap at or below it would turn permitted text into a 422.
		expect(subject.editorialLimit).toBeLessThanOrEqual(subject.validationCap);
		expect(body.editorialLimit).toBeLessThanOrEqual(body.validationCap);
	});
});

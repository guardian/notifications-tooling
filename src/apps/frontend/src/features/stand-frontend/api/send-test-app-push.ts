import z from 'zod';
import type { Result } from '../../../api/client';
import { safeFetchJsonAndParse } from '../../../api/client';

export type TestAppPushSendRequest = {
	channels: {
		'app-push': {
			audience: {
				type: 'email';
				items: string[];
			};
			compose: {
				use: string;
			};
		};
	};
	options: {
		dryRun: boolean;
	};
	idempotencyKey: string;
	content: {
		items: Record<
			string,
			{
				type: 'app-push';
				title: string;
				body: string;
				link: string;
				media?: {
					type: 'image';
					imageUrl: string;
					thumbnailUrl?: string;
				};
			}
		>;
	};
	sender: string;
};

export const testAppPushResponseSchema = z.object({
	testId: z.string(),
	status: z.string(),
	dryRun: z.boolean(),
	plans: z
		.object({
			channel: z.string(),
			planId: z.string(),
			status: z.string(),
		})
		.array(),
	statusUrl: z.string(),
});
export type TestAppPushResponse = z.infer<typeof testAppPushResponseSchema>;

export type TestAppPushRequestFunction = {
	(request: TestAppPushSendRequest): Promise<Result<TestAppPushResponse>>;
};

export const requestTestAppPushSend: TestAppPushRequestFunction = (request) =>
	safeFetchJsonAndParse(
		testAppPushResponseSchema,
		'/v1/notification-tests',
		{
			method: 'POST',
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
		},
	);

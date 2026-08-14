import z from 'zod';
import { fetchJsonAndParse } from '../../../api/client';

// TO DO - the types and schemas partially replicate the ones defined in the backend
// because the backend schema rely on the actual config values for the segment ID etc for validation
// May be possible to refactor the schema definitions so that they are shared, but the
// backend uses the config value to refine its version of the schema.

export type TestEmailSendRequest = {
	channels: {
		newsletter: {
			audience: {
				type: 'email';
				items: string[];
			};
			variants: Array<'UK' | 'US' | 'AU'>;
			compose: {
				items: string[];
				subject: string;
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
				type: 'newsletter';
				title: string;
				body: string;
				link: string;
				media?:
					| {
							type: 'image';
							imageUrl: string;
							thumbnailUrl?: string | undefined;
					  }
					| undefined;
			}
		>;
	};
	sender: string;
};

export const testEmailResponseSchema = z.object({
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
export type TestEmailResponse = z.infer<typeof testEmailResponseSchema>;

export type TestEmailRequestFunction = {
	(request: TestEmailSendRequest): Promise<TestEmailResponse>;
};

export const requestTestEmailSend: TestEmailRequestFunction = (request) =>
	fetchJsonAndParse(testEmailResponseSchema, '/v1/notification-tests', {
		method: 'POST',
		body: JSON.stringify(request),
		headers: { 'Content-Type': 'application/json' },
	});

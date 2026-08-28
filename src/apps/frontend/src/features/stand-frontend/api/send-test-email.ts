import type z from 'zod';
import type { Result } from '../../../api/client';
import { safeFetchJsonAndParse } from '../../../api/client';
import { notificationResourceSchema } from './schemas';

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
			variants: string[];
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

export const testEmailResponseSchema = notificationResourceSchema;
export type TestEmailResponse = z.infer<typeof testEmailResponseSchema>;

export type TestEmailRequestFunction = {
	(request: TestEmailSendRequest): Promise<Result<TestEmailResponse>>;
};

export const requestTestEmailSend: TestEmailRequestFunction = (request) =>
	safeFetchJsonAndParse(testEmailResponseSchema, '/v1/notification-tests', {
		method: 'POST',
		body: JSON.stringify(request),
		headers: { 'Content-Type': 'application/json' },
	});

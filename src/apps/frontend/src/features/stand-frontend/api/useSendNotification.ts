import { useMutation } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../../../api/client';
import {
	type SendNotificationRequest,
	sendNotificationResponseSchema,
} from './schemas';

/**
 * Sends the dispatch envelope. Never auto-retries (Decision 8) — the shared
 * `queryClient` disables mutation retries, so a send can't silently fire
 * twice; lean on `idempotencyKey` for send-safety once the backend enforces it.
 */
export function useSendNotification() {
	return useMutation({
		mutationFn: (request: SendNotificationRequest) =>
			fetchJsonAndParse(sendNotificationResponseSchema, '/v1/notifications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request),
			}),
	});
}

import { fetchJsonAndParse } from '../../../api/client';
import { ApiError } from '../../../api/errors';
import type { NotificationState, SendingResult } from '../types';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from './schemas';
import { sendNotificationResponseSchema } from './schemas';

export const sendNotification = async (
	notification: NotificationState,
): Promise<SendingResult> => {
	const { parameters, content } = notification;
	if (!content || parameters?.type !== 'email') {
		throw new Error('incomplete');
	}

	const { subject, preview, audienceSegments } = parameters;
	if (!subject || !preview || !audienceSegments) {
		throw new Error('incomplete');
	}
	const idempotencyKey = `email-notification:${content.id}`;

	const payload: SendNotificationRequest = {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'newsletter',
					title: subject,
					body: preview,
					link: content.webUrl,
				},
			},
		},
		channels: {
			newsletter: {
				audience: {
					type: 'segment',
					items: audienceSegments,
				},
				compose: {
					items: ['lead-story'],
					subject: subject,
				},
			},
		},
		sender: 'editorial-newsletters',
		options: {
			dryRun: false,
			scheduledFor: null,
		},
	};

	const headers = new Headers();
	headers.append('Content-Type', 'application/json');

	try {
		const confirmation: SendNotificationResponse = await fetchJsonAndParse(
			sendNotificationResponseSchema,
			'/v1/notifications',
			{
				method: 'POST',
				headers,
				body: JSON.stringify(payload),
				credentials: 'include',
			},
		);
		return {
			ok: true,
			response: confirmation,
		};
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.failure === 'fetch-fail') {
				return {
					ok: false,
					requestFailed: true,
					response: undefined,
				};
			}

			if (
				err.failure === 'json-parse-fail' ||
				err.failure === 'schema-parse-fail'
			) {
				// TO DO - this indicate the response was ok but the JSON payload could not be
				// parsed. Need to allow for this on the modelling?
			}

			// TO DO - change state modeling to use the api models
			return {
				ok: false,
				response: {
					error: err.failure,
					message: err.message,
				},
			};
		}

		console.warn('fetch fail', err);

		return {
			ok: false,
			requestFailed: true,
			response: undefined,
		};
	}
};

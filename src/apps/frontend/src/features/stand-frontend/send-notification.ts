import type { SendEmailRequest, SendingResult } from '@models';
import type { NotificationState } from './types';

export const sendNotification = async (
	notification: NotificationState,
): Promise<SendingResult> => {
	const { parameters, content } = notification;
	if (!content || parameters?.type !== 'email') {
		throw new Error('incomplete');
	}

	const { subject, preview, audienceSegments = [] } = parameters;
	const idempotencyKey = `email-notification:${content.id}`;

	const payload: SendEmailRequest = {
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
		const response = await fetch('/v1/notifications', {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
			credentials: 'include',
		});

		if (!response.ok) {
			console.warn('Non-ok response', response.statusText)
		}
		const json: unknown = await response.json();

		// TO DO - parsing from schema
		const result = json as SendingResult;
		return result;

	} catch (err) {
		console.warn('fetch fail', err);

		return {
			ok: false,
			requestFailed: true,
			response: undefined,
		};
	}
};

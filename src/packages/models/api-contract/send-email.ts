export type AudienceSegment = 'UK' | 'US' | 'AU';

// TO DO - move the schemas and types from backend to @models
export type SendEmailRequest = {
	idempotencyKey: string;
	content: {
		items: {
			'lead-story': {
				type: string;
				title: string | undefined;
				body: string | undefined;
				link: string;
			};
		};
	};
	channels: {
		newsletter: {
			audience: {
				type: string;
				items: AudienceSegment[];
			};
			compose: {
				items: string[];
				subject: string | undefined;
			};
		};
	};
	sender: string;
	options: {
		dryRun: boolean;
		scheduledFor: null;
	};
};

export type SendError =
	| 'insufficient_permissions'
	| 'bad_request'
	| 'validation_failed'
	| 'unauthenticated';


// TO DO - match the actual full backend response
export type SendingResult =
	| {
			ok: true;
			response: {
				status: 'accepted';
			};
	  }
	| {
			ok: false;
			response: {
				error: SendError;
				message: string;
			};
			requestFailed?: false;
	  }
	| {
			ok: false;
			requestFailed: true;
			response?: undefined;
	  };

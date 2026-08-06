export type AudienceSegment = 'UK' | 'US' | 'AU';

export type SendError =
	| 'json-parse-fail'
	| 'schema-parse-fail'
	| 'non-2xx-response'
	| 'timeout'
	| 'unauthenticated'
	| 'forbidden';

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

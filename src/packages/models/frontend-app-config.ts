import type { User } from '@guardian/pan-domain-node';

export type { User };

export interface UserResponse {
	user: User;
	permissions: string[];
}

export type Stage = 'DEV' | 'CODE' | 'PROD';

export type AppConfig = UserResponse & {
	stage?: Stage;
	gridApiUri: string;
	gridUri: string;
	dispatchUserGuideUrl: string;
	dispatchFeedbackFormUrl: string;
	sessionId: string;
};

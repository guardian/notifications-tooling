import type { User } from '@guardian/pan-domain-node';

declare global {
	namespace Express {
		interface Request {
			/**
			 * The authenticated Panda user, populated by `authMiddleware` once a
			 * valid `gutoolsAuth-assym` cookie has been verified. Optional because
			 * TypeScript cannot know which middleware ran before a given handler;
			 * guard with `if (!req.user)` before relying on it.
			 */
			user?: User;
		}
	}
}

export {};

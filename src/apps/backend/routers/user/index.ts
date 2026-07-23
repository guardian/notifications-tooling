import { type Request, type Response, Router } from 'express';

/**
 * The authenticated user, as decoded from the pan-domain (Panda) cookie by
 * `pan-domain-node`. Mirrors that library's `User` interface so this mock can
 * be swapped for real Panda verification without changing the response shape.
 */
export interface User {
	firstName: string;
	lastName: string;
	email: string;
	/** Optional profile picture URL; absent when the provider supplies none. */
	avatarUrl?: string;
	/** The app that issued the login. */
	authenticatingSystem: string;
	/** The apps the user has been validated in. */
	authenticatedIn: string[];
	/** Cookie expiry as epoch milliseconds. */
	expires: number;
	/** Whether the login was made with multi-factor authentication. */
	multifactor: boolean;
}

/**
 * A stand-in for the user Panda would resolve from the shared cookie. Used
 * until `pan-domain-node` verification is wired into the backend so the SPA can
 * develop against a stable `GET /v1/user` contract.
 */
export const sampleUser: User = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada.lovelace@guardian.co.uk',
	avatarUrl: 'https://avatars.example.com/ada-lovelace.png',
	authenticatingSystem: 'notifications-tooling',
	authenticatedIn: ['notifications-tooling'],
	expires: Date.now() + 60 * 60 * 1000,
	multifactor: true,
};

/**
 * `GET /v1/user`. Returns the authenticated user. This is currently a mock
 * returning {@link sampleUser}; it will be backed by pan-domain-node cookie
 * verification once Panda is integrated into the backend.
 */
export const userHandler = (_req: Request, res: Response) => {
	res.json(sampleUser);
};

export const userRouter = Router().get('/', userHandler);

import type { RequestHandler } from 'msw';
import { channelHandlers } from './channels';
import { notificationHandlers } from './notifications';

/**
 * All feature handlers, shared by `bun test` (`server.ts`) and Storybook. The
 * browser worker was removed once the SPA started calling the real backend, so
 * these mock the contract for tests and stories only.
 */
export const handlers: RequestHandler[] = [
	...channelHandlers,
	...notificationHandlers,
];

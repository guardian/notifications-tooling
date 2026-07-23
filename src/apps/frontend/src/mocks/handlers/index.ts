import type { RequestHandler } from 'msw';
import { notificationHandlers } from './notifications';
import { previewHandlers } from './preview';

/**
 * All feature handlers, shared by `browser.ts` and `server.ts` so dev,
 * Storybook and `bun test` mock the same contract; cutover to a real
 * backend is deleting entries here (see docs/frontend-api-layer/plan.md).
 */
export const handlers: RequestHandler[] = [
	...notificationHandlers,
	...previewHandlers,
];

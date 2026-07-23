import { setupWorker } from 'msw/browser';
import { previewHandlers } from './handlers/preview';

/**
 * Development keeps preview mocked while notification requests pass through
 * to the frontend server's backend proxy. Storybook configures all handlers.
 */
export const worker = setupWorker(...previewHandlers);

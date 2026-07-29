import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * The MSW server used by `bun test` (Node environment). There is no browser
 * worker: dev mode calls the real backend, so mocking is for tests and
 * Storybook only, which shares `./handlers` through `.storybook/preview.tsx`.
 */
export const server = setupServer(...handlers);

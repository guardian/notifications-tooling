import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * The MSW server used by `bun test` (Node environment). Browser dev mode
 * uses `./browser.ts` instead; both share `./handlers`.
 */
export const server = setupServer(...handlers);

/**
 * Registers a DOM environment (via happy-dom) so `bun test` can run
 * React Testing Library hook/component tests. Loaded as a `bunfig.toml`
 * test preload — see bunfig.toml in this workspace.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator';

const NativeAbortController = globalThis.AbortController;
const NativeAbortSignal = globalThis.AbortSignal;
const nativeFetch = globalThis.fetch;
const NativeHeaders = globalThis.Headers;
const NativeRequest = globalThis.Request;
const NativeResponse = globalThis.Response;

GlobalRegistrator.register({ url: 'http://localhost:3000' });

globalThis.AbortController = NativeAbortController;
globalThis.AbortSignal = NativeAbortSignal;
globalThis.fetch = nativeFetch;
globalThis.Headers = NativeHeaders;
globalThis.Request = NativeRequest;
globalThis.Response = NativeResponse;

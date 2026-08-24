import { afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';

// Optional: cleans up `render` after each test
afterEach(() => {
	cleanup();
});

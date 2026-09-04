import { describe, expect, it } from 'bun:test';
import { channelConstraintsResponseSchema } from '../../../frontend/src/schemas';
import { channelConstraints } from './index';

describe('channel constraints frontend contract', () => {
	it('is accepted by the frontend response schema', () => {
		expect(channelConstraintsResponseSchema.parse(channelConstraints)).toEqual(
			channelConstraints,
		);
	});
});

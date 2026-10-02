import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { renderHook } from '@testing-library/react';
import '../../happydom-setup';
import { useRelativeTimeClock } from './useRelativeTime';

const nativeSetInterval = globalThis.setInterval;
const nativeClearInterval = globalThis.clearInterval;
const intervalId = 123 as unknown as ReturnType<typeof setInterval>;

let setIntervalMock: ReturnType<typeof mock>;
let clearIntervalMock: ReturnType<typeof mock>;

const isoTimeAgo = (milliseconds: number) =>
	new Date(Date.now() - milliseconds).toISOString();

beforeEach(() => {
	setIntervalMock = mock(() => intervalId);
	clearIntervalMock = mock(() => undefined);
	globalThis.setInterval = setIntervalMock as typeof setInterval;
	globalThis.clearInterval = clearIntervalMock as typeof clearInterval;
});

afterEach(() => {
	globalThis.setInterval = nativeSetInterval;
	globalThis.clearInterval = nativeClearInterval;
});

describe('useRelativeTimeClock', () => {
	it('does not schedule a timer when every date uses absolute time', () => {
		const { result } = renderHook(() =>
			useRelativeTimeClock([isoTimeAgo(25 * 60 * 60 * 1000)]),
		);

		expect(result.current).toBeInstanceOf(Date);
		expect(setIntervalMock).not.toHaveBeenCalled();
	});

	it('does not schedule a timer for an empty date list', () => {
		renderHook(() => useRelativeTimeClock([]));

		expect(setIntervalMock).not.toHaveBeenCalled();
	});

	it('uses the shortest refresh interval and clears it on unmount', () => {
		const { unmount } = renderHook(() =>
			useRelativeTimeClock([
				isoTimeAgo(2 * 60 * 60 * 1000),
				isoTimeAgo(10 * 60 * 1000),
				isoTimeAgo(25 * 60 * 60 * 1000),
			]),
		);

		expect(setIntervalMock).toHaveBeenCalledTimes(1);
		expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 30_000);

		unmount();

		expect(clearIntervalMock).toHaveBeenCalledWith(intervalId);
	});

	it('clears the timer when all dates transition to absolute time', () => {
		const { rerender } = renderHook(
			({ iso8601 }) => useRelativeTimeClock([iso8601]),
			{ initialProps: { iso8601: isoTimeAgo(10 * 60 * 1000) } },
		);

		expect(setIntervalMock).toHaveBeenCalledTimes(1);

		rerender({ iso8601: isoTimeAgo(25 * 60 * 60 * 1000) });

		expect(clearIntervalMock).toHaveBeenCalledWith(intervalId);
		expect(setIntervalMock).toHaveBeenCalledTimes(1);
	});
});

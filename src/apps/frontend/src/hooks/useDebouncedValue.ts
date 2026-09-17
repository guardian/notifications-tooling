import { useEffect, useState } from 'react';

export const useDebouncedValue = <Value>(
	value: Value,
	delay: number,
): Value => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
		return () => window.clearTimeout(timeoutId);
	}, [delay, value]);

	return debouncedValue;
};

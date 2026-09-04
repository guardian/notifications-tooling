export const DEFAULT_LIMIT = 20;
export const MAXIMUM_LIMIT = 50;
export const DEFAULT_OFFSET = 0;

const parseBoundedInteger = (
	value: string | null,
	fallback: number,
	minimum: number,
	maximum?: number,
) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) &&
		parsed >= minimum &&
		(maximum === undefined || parsed <= maximum)
		? parsed
		: fallback;
};

export const parseHistorySearchParams = (searchParams: URLSearchParams) => ({
	limit: parseBoundedInteger(
		searchParams.get('limit'),
		DEFAULT_LIMIT,
		1,
		MAXIMUM_LIMIT,
	),
	offset: parseBoundedInteger(searchParams.get('offset'), DEFAULT_OFFSET, 0),
	since: (() => {
		const value = searchParams.get('since');
		if (value === null) {
			return undefined;
		}
		const parsed = Number(value);
		return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
	})(),
});

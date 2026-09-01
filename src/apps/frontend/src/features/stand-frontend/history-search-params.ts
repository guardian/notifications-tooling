const defaultLimit = 20;
const maximumLimit = 50;

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
		defaultLimit,
		1,
		maximumLimit,
	),
	offset: parseBoundedInteger(searchParams.get('offset'), 0, 0),
	since: (() => {
		const value = searchParams.get('since');
		if (value === null) {
			return undefined;
		}
		const parsed = Number(value);
		return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
	})(),
});

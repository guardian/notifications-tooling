export const getWindowHistoryState = (): unknown => {
	const state: unknown = window.history.state;
	return state;
};

export const getWindowHistoryRecord = (): Record<string, unknown> => {
	const state = getWindowHistoryState();
	return state && typeof state === 'object'
		? (state as Record<string, unknown>)
		: {};
};

export const getWindowRouterState = (): unknown => getWindowHistoryRecord().usr;

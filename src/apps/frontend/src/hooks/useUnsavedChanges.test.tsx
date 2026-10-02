import { describe, expect, it, mock } from 'bun:test';
import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import '../../happydom-setup';
import { UnsavedChangesContext } from '../navigation/UnsavedChangesContext';
import { useUnsavedChanges } from './useUnsavedChanges';

const dispatchBeforeUnload = () =>
	window.dispatchEvent(new Event('beforeunload', { cancelable: true }));

const setup = (initialHasUnsavedChanges: boolean) => {
	const setHasUnsavedChanges = mock(() => undefined);
	const wrapper = ({ children }: PropsWithChildren) => (
		<UnsavedChangesContext.Provider value={setHasUnsavedChanges}>
			{children}
		</UnsavedChangesContext.Provider>
	);
	const hook = renderHook(
		({ hasUnsavedChanges }) => useUnsavedChanges(hasUnsavedChanges),
		{ initialProps: { hasUnsavedChanges: initialHasUnsavedChanges }, wrapper },
	);

	return { ...hook, setHasUnsavedChanges };
};

describe('useUnsavedChanges', () => {
	it('publishes changes and warns before unloading only while dirty', () => {
		const { rerender, setHasUnsavedChanges } = setup(false);

		expect(setHasUnsavedChanges).toHaveBeenLastCalledWith(false);
		expect(dispatchBeforeUnload()).toBe(true);

		rerender({ hasUnsavedChanges: true });

		expect(setHasUnsavedChanges).toHaveBeenLastCalledWith(true);
		expect(dispatchBeforeUnload()).toBe(false);

		rerender({ hasUnsavedChanges: false });

		expect(setHasUnsavedChanges).toHaveBeenLastCalledWith(false);
		expect(dispatchBeforeUnload()).toBe(true);
	});

	it('clears the warning and published state when unmounted while dirty', () => {
		const { unmount, setHasUnsavedChanges } = setup(true);

		expect(dispatchBeforeUnload()).toBe(false);

		unmount();

		expect(setHasUnsavedChanges).toHaveBeenLastCalledWith(false);
		expect(dispatchBeforeUnload()).toBe(true);
	});
});

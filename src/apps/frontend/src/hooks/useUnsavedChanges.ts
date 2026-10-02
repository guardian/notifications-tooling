import { useContext, useEffect } from 'react';
import { UnsavedChangesContext } from '../navigation/UnsavedChangesContext';

export const useUnsavedChanges = (hasUnsavedChanges: boolean) => {
	const setHasUnsavedChanges = useContext(UnsavedChangesContext);

	useEffect(() => {
		setHasUnsavedChanges(hasUnsavedChanges);
		return () => setHasUnsavedChanges(false);
	}, [hasUnsavedChanges, setHasUnsavedChanges]);

	useEffect(() => {
		if (!hasUnsavedChanges) {
			return;
		}

		const warnBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = true;
		};

		window.addEventListener('beforeunload', warnBeforeUnload);
		return () => window.removeEventListener('beforeunload', warnBeforeUnload);
	}, [hasUnsavedChanges]);
};

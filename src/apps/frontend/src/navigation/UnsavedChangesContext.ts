import { createContext } from 'react';

export const UnsavedChangesContext = createContext<
	(hasUnsavedChanges: boolean) => void
>(() => undefined);

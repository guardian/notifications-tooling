import { createContext } from 'react';
import type { AppConfig } from './get-config';

export const UserContext = createContext<AppConfig | undefined>(undefined);

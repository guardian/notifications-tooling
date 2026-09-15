import type { AppConfig } from '@models';
import { createContext } from 'react';

export const ConfigContext = createContext<AppConfig | undefined>(undefined);

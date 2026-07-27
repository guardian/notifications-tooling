import { createContext } from 'react';
import type { UserResponse } from './types';

export const UserContext = createContext<UserResponse | undefined>(undefined);

import { createContext } from 'react';
import type { UserResponse } from './get-config';

export const UserContext = createContext<UserResponse | undefined>(undefined);

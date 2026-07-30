import { createContext } from 'react';
import type { UserResponse } from './get-user';

export const UserContext = createContext<UserResponse | undefined>(undefined);

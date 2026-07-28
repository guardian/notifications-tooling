import type { UserResponse } from '@utils';
import { createContext } from 'react';

export const UserContext = createContext<UserResponse | undefined>(undefined);

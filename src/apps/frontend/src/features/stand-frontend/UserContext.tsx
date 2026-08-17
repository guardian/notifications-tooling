import type { UserResponse } from '@models';
import { createContext } from 'react';

export const UserContext = createContext<UserResponse | undefined>(undefined);

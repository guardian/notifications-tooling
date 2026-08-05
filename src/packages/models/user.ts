import type { User } from '@guardian/pan-domain-node';

export type { User };

export interface UserResponse {
    user: User;
    permissions: string[];
}

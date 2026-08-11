import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { addDispatchStacks } from '../lib/register-stacks';

const app = new GuRoot();
addDispatchStacks(app);

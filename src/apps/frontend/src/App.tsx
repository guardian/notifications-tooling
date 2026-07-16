import './index.css';

import { DispatchPage } from './features/dispatch/DispatchPage';
import { EmailNotificationPage } from './features/stand-frontend/EmailNotificationPage';

const useEmailNotificationPage = true as boolean;

export function App() {
	return useEmailNotificationPage ? <EmailNotificationPage /> : <DispatchPage />;
}

import './index.css';

import { Navigate, Route, Routes } from 'react-router-dom';
import { CreateAppAlertTab } from './features/stand-frontend/components/CreateAppAlertTab';
import { CreateNewsletterEmailTab } from './features/stand-frontend/components/CreateNewsletterEmailTab';
import { HistoryTab } from './features/stand-frontend/components/HistoryTab';
import { NotFoundTab } from './features/stand-frontend/components/NotFoundTab';
import { EmailNotificationPage } from './features/stand-frontend/EmailNotificationPage';
import { appRoutes } from './features/stand-frontend/routes';

export function App() {
	return (
		<Routes>
			<Route element={<EmailNotificationPage />}>
				<Route
					index
					element={<Navigate to={appRoutes.createNewsletterEmail} replace />}
				/>
				<Route
					path={appRoutes.createNewsletterEmail}
					element={<CreateNewsletterEmailTab />}
				/>
				<Route
					path={appRoutes.createAppAlert}
					element={<CreateAppAlertTab />}
				/>
				<Route path={appRoutes.history} element={<HistoryTab />} />
				<Route path="*" element={<NotFoundTab />} />
			</Route>
		</Routes>
	);
}

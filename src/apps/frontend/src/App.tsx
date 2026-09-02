import './index.css';

import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { AppConfig } from '../../../packages/models';
import { CreateAppAlertTab } from './features/stand-frontend/components/CreateAppAlertTab';
import { CreateNewsletterEmailTab } from './features/stand-frontend/components/CreateNewsletterEmailTab';
import {
	AppAlertDispatchReportTab,
	NewsletterDispatchReportTab,
} from './features/stand-frontend/components/DispatchReport';
import { HistoryPage } from './features/stand-frontend/components/HistoryPage';
import { NotFoundTab } from './features/stand-frontend/components/NotFoundTab';
import { ConfigContext } from './features/stand-frontend/ConfigContext';
import { EmailNotificationPage } from './features/stand-frontend/EmailNotificationPage';
import { getAppConfig } from './features/stand-frontend/get-config';
import {
	AppAlertNotificationFormProvider,
	NewsletterNotificationFormProvider,
} from './features/stand-frontend/NotificationFormProvider';
import { getAppRoutes } from './features/stand-frontend/routes';

export function App() {
	const [config] = useState<AppConfig | undefined>(getAppConfig());
	const [appRoutes] = useState(() => getAppRoutes(config));

	return (
		<ConfigContext.Provider value={config}>
			<Routes>
				<Route element={<EmailNotificationPage />}>
					<Route
						index
						element={<Navigate to={appRoutes.createNewsletterEmail} replace />}
					/>
					<Route
						path="newsletter-email"
						element={
							<NewsletterNotificationFormProvider>
								<Outlet />
							</NewsletterNotificationFormProvider>
						}
					>
						<Route path="create" element={<CreateNewsletterEmailTab />} />
						<Route path="report" element={<NewsletterDispatchReportTab />} />
					</Route>
					{appRoutes.createAppAlert && (
						<Route
							path="app-alert"
							element={
								<AppAlertNotificationFormProvider>
									<Outlet />
								</AppAlertNotificationFormProvider>
							}
						>
							<Route path="create" element={<CreateAppAlertTab />} />
							<Route path="report" element={<AppAlertDispatchReportTab />} />
						</Route>
					)}
					<Route path={appRoutes.history} element={<HistoryPage />} />
					<Route path="*" element={<NotFoundTab />} />
				</Route>
			</Routes>
		</ConfigContext.Provider>
	);
}

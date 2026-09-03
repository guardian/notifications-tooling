import './index.css';

import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { AppConfig } from '../../../packages/models';
import { CreateAppAlertTab } from './compose/CreateAppAlertTab';
import { CreateNewsletterEmailTab } from './compose/CreateNewsletterEmailTab';
import {
	AppAlertNotificationFormProvider,
	NewsletterNotificationFormProvider,
} from './compose/NotificationFormProvider';
import { ConfigContext } from './config/ConfigContext';
import { getAppConfig } from './config/get-config';
import { EmailNotificationPage } from './EmailNotificationPage';
import { HistoryPage } from './history/HistoryPage';
import { NotFoundTab } from './layout/NotFoundTab';
import { getAppRoutes } from './routes';
import {
	AppAlertDispatchReportTab,
	NewsletterDispatchReportTab,
} from './send/DispatchReport';

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

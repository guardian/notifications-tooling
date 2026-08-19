import './index.css';

import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { AppConfig } from '../../../packages/models';
import { CreateAppAlertTab } from './features/stand-frontend/components/CreateAppAlertTab';
import { CreateNewsletterEmailTab } from './features/stand-frontend/components/CreateNewsletterEmailTab';
import { HistoryTab } from './features/stand-frontend/components/HistoryTab';
import { NotFoundTab } from './features/stand-frontend/components/NotFoundTab';
import { ConfigContext } from './features/stand-frontend/ConfigContext';
import { EmailNotificationPage } from './features/stand-frontend/EmailNotificationPage';
import { getAppConfig } from './features/stand-frontend/get-config';
import {
	defaultAppAlertState,
	defaultState,
} from './features/stand-frontend/notification-reducer';
import { NotificationFormProvider } from './features/stand-frontend/NotificationFormProvider';
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
						path={appRoutes.createNewsletterEmail}
						element={
							<NotificationFormProvider
								key="newsletter"
								initialNotification={defaultState}
							>
								<CreateNewsletterEmailTab />
							</NotificationFormProvider>
						}
					/>
					{appRoutes.createAppAlert && (
						<Route
							path={appRoutes.createAppAlert}
							element={
								<NotificationFormProvider
									key="app-alert"
									initialNotification={defaultAppAlertState}
								>
									<CreateAppAlertTab />
								</NotificationFormProvider>
							}
						/>
					)}
					<Route path={appRoutes.history} element={<HistoryTab />} />
					<Route path="*" element={<NotFoundTab />} />
				</Route>
			</Routes>
		</ConfigContext.Provider>
	);
}

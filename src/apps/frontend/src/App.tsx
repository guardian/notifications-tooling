import './index.css';

import { Navigate, Route, Routes } from 'react-router-dom';
import { DispatchTab } from './features/stand-frontend/components/DispatchTab';
import { HistoryTab } from './features/stand-frontend/components/HistoryTab';
import { NotFoundTab } from './features/stand-frontend/components/NotFoundTab';
import { EmailNotificationPage } from './features/stand-frontend/EmailNotificationPage';

export function App() {
	return (
		<Routes>
			<Route element={<EmailNotificationPage />}>
				<Route index element={<Navigate to="/create" replace />} />
				<Route path="create" element={<DispatchTab />} />
				<Route path="history" element={<HistoryTab />} />
				<Route path="*" element={<NotFoundTab />} />
			</Route>
		</Routes>
	);
}

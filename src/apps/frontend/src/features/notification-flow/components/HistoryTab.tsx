import { Layout } from '@guardian/stand/Layout';
import { useContext } from 'react';
import { UserContext } from '../UserContext';

export const HistoryTab = () => {
	const user = useContext(UserContext);
	return (
		<Layout.Main>
			<h1>Hello {user?.firstName ?? 'user'}.</h1>
			<p>History </p>
		</Layout.Main>
	);
};

import { Layout } from '@guardian/stand/Layout';
import { useContext } from 'react';
import { UserContext } from '../UserContext';

export const DispatchTab = () => {
	const user = useContext(UserContext);
	return (
		<Layout.Main>
			<h1>Hello {user?.firstName ?? 'user'}.</h1>
			<p>CREATE </p>
		</Layout.Main>
	);
};

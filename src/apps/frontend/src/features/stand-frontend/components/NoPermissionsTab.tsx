import { Layout } from '@guardian/stand/Layout';
import { layoutMainTheme } from '../themes';

export const NoPermissionsTab = () => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<p>You do not have permissions to use dispatch</p>
		</Layout.Main>
	);
};

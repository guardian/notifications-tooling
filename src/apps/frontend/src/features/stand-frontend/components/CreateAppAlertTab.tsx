import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { layoutMainTheme } from '../themes';

export const CreateAppAlertTab = () => (
	<Layout.Main theme={layoutMainTheme}>
		<div css={{ padding: semanticSpacing.stackXl }}>
			<Typography variant="heading2Xl" element="h1">
				Create app alert
			</Typography>
		</div>
	</Layout.Main>
);

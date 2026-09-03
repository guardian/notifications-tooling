import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { getAppRoutes } from '../routes';

export const NotFoundTab = () => {
	const config = useContext(ConfigContext);
	return (
		<Layout.Main>
			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					gap: semanticSpacing.stackMd,
					padding: semanticSpacing.stackLg,
				}}
			>
				<Typography variant="heading2Xl" element="h1">
					Page not found
				</Typography>
				<Typography>The page you requested does not exist.</Typography>
				<LinkButton
					href={getAppRoutes(config).createNewsletterEmail}
					variant="primary"
				>
					Go to Create newsletter email
				</LinkButton>
			</div>
		</Layout.Main>
	);
};

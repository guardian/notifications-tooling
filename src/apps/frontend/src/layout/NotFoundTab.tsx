import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { getAppRoutes } from '../routes';
import { useTelemetryBeforeInternalLink } from '../telemetry/TelemetryContext';

export const NotFoundTab = () => {
	const sendTelemetryAndNavigate =
		useTelemetryBeforeInternalLink('NotFoundTab');
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
					{...sendTelemetryAndNavigate(getAppRoutes().createNewsletterEmail)}
					variant="primary"
				>
					Go to Create newsletter email
				</LinkButton>
				<LinkButton
					{...sendTelemetryAndNavigate(getAppRoutes().createAppAlert)}
					variant="primary"
				>
					Go to Create app alert
				</LinkButton>
			</div>
		</Layout.Main>
	);
};

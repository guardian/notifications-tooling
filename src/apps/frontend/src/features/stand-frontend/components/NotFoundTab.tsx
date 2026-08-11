import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';

export const NotFoundTab = () => (
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
			<LinkButton href="/create" variant="primary">
				Go to Create
			</LinkButton>
		</div>
	</Layout.Main>
);

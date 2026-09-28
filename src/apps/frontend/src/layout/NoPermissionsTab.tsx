import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { CENTRAL_PRODUCTION_CONTACT_HREF } from '../support-links';

export const NoPermissionsTab = () => {
	return (
		<Layout.Main>
			<div
				css={{
					paddingLeft: semanticSpacing.stackLg,
					paddingRight: semanticSpacing.stackLg,
				}}
			>
				<Typography variant="heading2Xl" element="h2">
					Unauthorised
				</Typography>
				<Typography>
					You don&apos;t have permission to access this page, please{' '}
					<a href={CENTRAL_PRODUCTION_CONTACT_HREF}>
						contact central production
					</a>{' '}
					if you require access.
				</Typography>
			</div>
		</Layout.Main>
	);
};

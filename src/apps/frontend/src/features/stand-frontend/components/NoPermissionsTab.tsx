import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';

interface Props {
	userLoaded: boolean;
	userLoadingError?: Error;
}

const getMessaging = (userLoaded: boolean, userLoadingError?: Error) => {
	if (userLoaded) {
		return (
			<>
				<Typography variant="heading2Xl" element="h2">
					Unauthorised
				</Typography>
				<Typography>
					You don&apos;t have permission to access this page, please{' '}
					<a href="mailto:central.production@guardian.co.uk">
						contact central production
					</a>{' '}
					if you require access.
				</Typography>
			</>
		);
	}

	// TO DO - different error types/code
	if (userLoadingError) {
		return (
			<>
				<Typography variant="heading2Xl" element="h2">
					Error
				</Typography>
				<Typography>
					Your user profile could not be reached. please{' '}
					<a href="mailto:central.production@guardian.co.uk">
						contact central production
					</a>{' '}
					if the problem persists.
				</Typography>
			</>
		);
	}

	// no user, no error, so still loading.
	return null;
};

export const NoPermissionsTab = ({ userLoaded, userLoadingError }: Props) => {
	return (
		<Layout.Main>
			<div
				css={{
					paddingLeft: semanticSpacing.stackLg,
					paddingRight: semanticSpacing.stackLg,
				}}
			>
				{getMessaging(userLoaded, userLoadingError)}
			</div>
		</Layout.Main>
	);
};

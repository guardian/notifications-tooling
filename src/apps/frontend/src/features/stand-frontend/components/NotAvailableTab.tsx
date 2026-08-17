import { semanticSpacing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';

const NotAvailableTab = ({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) => {
	return (
		<Layout.Main>
			<div
				css={{
					paddingLeft: semanticSpacing.stackLg,
					paddingRight: semanticSpacing.stackLg,
				}}
			>
				<Typography variant="heading2Xl" element="h2">
					{title}
				</Typography>
				{children}
			</div>
		</Layout.Main>
	);
};

export const NoPermissionsTab = () => (
	<NotAvailableTab title="Unauthorised">
		<Typography>
			You don&apos;t have permission to access this page, please{' '}
			<a href="mailto:central.production@guardian.co.uk">
				contact central production
			</a>{' '}
			if you require access.
		</Typography>
	</NotAvailableTab>
);

export const UnderConstructionTab = () => (
	<NotAvailableTab title="Under Construction">
		<Typography>
			This page is under construction and is not currently available.
		</Typography>
	</NotAvailableTab>
);

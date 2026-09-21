import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ComponentProps } from 'react';
import { historyViewStyles } from '../themes';

type EmptyStateIcon = ComponentProps<typeof Icon>['symbol'];

interface EmptyStateProps {
	title: string;
	description: string;
	icon?: EmptyStateIcon;
}

export const EmptyState = ({
	title,
	description,
	icon = 'notifications',
}: EmptyStateProps) => (
	<div css={historyViewStyles.empty}>
		<div css={historyViewStyles.emptyIcon} aria-hidden="true">
			<Icon symbol={icon} size="lg" />
		</div>
		<Typography element="h2" variant="headingSm">
			{title}
		</Typography>
		<Typography variant="bodyMd" cssOverrides={historyViewStyles.emptyCopy}>
			{description}
		</Typography>
	</div>
);

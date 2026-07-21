import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';

export const Confirmation = () => {
	const { updateNotification } = useContext(NotificationContext);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',

				gap: semanticSpacing.stackLg,
			}}
		>
			<Typography variant="heading2Xl" element="h2">
				Confirmation
			</Typography>

			<div>
				<header>
					<Typography variant="headingCompactMd">Details</Typography>
				</header>
				<div>{/* TO DO - get details */}</div>
			</div>

			<div>
				<Button onClick={() => updateNotification({ type: 'reset' })}>
					Done
				</Button>
			</div>
		</div>
	);
};

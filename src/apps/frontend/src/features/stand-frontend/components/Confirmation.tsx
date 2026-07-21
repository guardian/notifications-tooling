import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';
import { kickerNameMap } from '../types';

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackLg,
		maxWidth: 668,
	}),
	parameter: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
	}),
	detailsBox: css({
		borderWidth: semanticSizing.border.default,
		borderStyle: 'solid',
		borderColor: semanticColors.border.weak,

		header: {
			padding: semanticSpacing.stackSm,
			backgroundColor: semanticColors.fill.neutralWeak,
		},
		section: {
			padding: semanticSpacing.stackSm,
			display: 'flex',
			flexDirection: 'column',
			gap: semanticSpacing.stackSm,
		},
	}),
};

const ParameterDisplay = ({
	keyName,
	value,
}: {
	keyName: string;
	value: string;
}) => {
	return (
		<div css={styles.parameter}>
			<Typography variant="bodyBoldMd">{keyName}:</Typography>
			<Typography>{value}</Typography>
		</div>
	);
};

export const Confirmation = () => {
	const { updateNotification, notification } = useContext(NotificationContext);

	const notificationDescription =
		notification.parameters?.type === 'email'
			? 'email newsletter'
			: 'push notification';

	return (
		<section css={styles.container}>
			<div>
				<Typography variant="heading2Xl" element="h2">
					Confirmation
				</Typography>
				<Typography>
					The sent {notificationDescription} details can be seen below
				</Typography>
			</div>

			<div css={styles.detailsBox}>
				<header>
					<Typography variant="headingMd">Details</Typography>
				</header>

				{notification.parameters?.type === 'email' && (
					<section>
						<ParameterDisplay keyName="Channel" value="Email Newsletter" />
						<ParameterDisplay
							keyName="Kicker"
							value={
								kickerNameMap[notification.parameters.kicker ?? 'undefined']
							}
						/>
						<ParameterDisplay keyName="Audience" value="TBC" />
						<ParameterDisplay keyName="Delivery" value="Immediate" />
					</section>
				)}
			</div>

			<div>
				<Button onClick={() => updateNotification({ type: 'reset' })}>
					Done
				</Button>
			</div>
		</section>
	);
};

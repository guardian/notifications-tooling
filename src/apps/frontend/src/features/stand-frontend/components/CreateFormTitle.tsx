import { semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { TextLinkButton } from './TextLinkButton';

export const CreateFormTitle = ({ title }: { title: string }) => {
	const { updateNotification } = useContext(NotificationFormContext);
	return (
		<section
			css={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				maxWidth: '470px',
				borderLeft: `${semanticSizing.border.md} solid transparent`,
				paddingLeft: semanticSpacing.stackMd,
			}}
		>
			<Typography variant="heading2Xl" element="h2">
				{title}
			</Typography>
			<TextLinkButton
				text={'Clear all fields'}
				onClick={() => updateNotification({ type: 'reset' })}
			/>
		</section>
	);
};

import { semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { TextLinkButton } from './TextLinkButton';

export interface CreateFormTitleProps {
	title: string;
	setArticleInputText: (setArticleInputText: string) => void;
	setLockArticleInputText: (lockArticleInputText: boolean) => void;
}
export const CreateFormTitle = ({
	title,
	setArticleInputText,
	setLockArticleInputText,
}: CreateFormTitleProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
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
				onClick={() => {
					setArticleInputText('');
					setLockArticleInputText(false);
					updateNotification({
						type:
							notification.parameters?.type === 'email'
								? 'reset'
								: 'reset-app-alert',
					});
				}}
			/>
		</section>
	);
};

import { semanticSizing, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useFormContext } from 'react-hook-form';
import { TextLinkButton } from '../ui/TextLinkButton';

export interface CreateFormTitleProps {
	title: string;
	setArticleInputText: (setArticleInputText: string) => void;
	setLockArticleInputText: (lockArticleInputText: boolean) => void;
	onResetNotification: () => void;
}
export const CreateFormTitle = ({
	title,
	setArticleInputText,
	setLockArticleInputText,
	onResetNotification,
}: CreateFormTitleProps) => {
	const { reset } = useFormContext();
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
					reset();
					onResetNotification();
				}}
			/>
		</section>
	);
};

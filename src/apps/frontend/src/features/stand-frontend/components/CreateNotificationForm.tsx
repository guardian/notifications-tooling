import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import type { Kicker } from '../api/schemas';
import type { NotificationDraft } from '../useNotificationDraft';

export interface CreateNotificationFormProps {
	draft: NotificationDraft;
	onArticleUrlChange: (value: string) => void;
	onKickerChange: (value: Kicker) => void;
	onSubjectChange: (value: string) => void;
	onPreviewTextChange: (value: string) => void;
	onSend: () => void;
	isSending: boolean;
	sendSucceeded: boolean;
	sendErrorMessage?: string;
}

export const CreateNotificationForm = ({
	draft,
	onArticleUrlChange,
	onSubjectChange,
	onPreviewTextChange,
	onSend,
	isSending,
	sendSucceeded,
	sendErrorMessage,
}: CreateNotificationFormProps) => {
	return (
		<>
			<Typography variant="titleMd" element="h2">
				Create a Notification
			</Typography>

			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
				}}
			>
				<TextInput
					label="Article"
					description="Copy and paste a Guardian URL below"
					value={draft.articleUrl}
					onChange={onArticleUrlChange}
				/>

				<Select
					label="Kicker"
					description="Choose the kicker for the email newsletter"
				>
					<Option id="breaking-news">Breaking News</Option>
					<Option id="exclusive">Exclusive</Option>
					<Option id="none">None</Option>
				</Select>

				<TextInput
					label="Subject"
					description="The kicker counts towards the character limit of the subject"
					value={draft.subject}
					onChange={onSubjectChange}
				/>

				<TextInput
					label="Preview text"
					description="Choose the preview text for the email newsletter"
					value={draft.previewText}
					onChange={onPreviewTextChange}
				/>
				<div
					css={{
						display: 'flex-start',
						flexDirection: 'column',
						gap: semanticSpacing.stackSm,
					}}
				>
					<Button variant="primary" onPress={onSend} isDisabled={isSending}>
						Validate example
					</Button>

					{sendSucceeded && (
						<InlineMessage level="success">
							Example accepted by backend.
						</InlineMessage>
					)}
					{sendErrorMessage && (
						<InlineMessage level="error">
							Validation failed: {sendErrorMessage}
						</InlineMessage>
					)}
				</div>
			</div>
		</>
	);
};

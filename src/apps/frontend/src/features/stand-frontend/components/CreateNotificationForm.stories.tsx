import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { buildDryRunNotificationRequest } from '../api/buildDryRunNotificationRequest';
import { useSendNotification } from '../api/useSendNotification';
import { useNotificationDraft } from '../useNotificationDraft';
import { CreateNotificationForm } from './CreateNotificationForm';

const meta = {
	title: 'Stand Frontend/CreateNotificationForm',
	component: CreateNotificationForm,
	parameters: {
		docs: {
			description: {
				component:
					'Wired to real (MSW-mocked) `useNotificationDraft` and `useSendNotification` hooks, so this story exercises the actual controlled form and send flow.',
			},
		},
	},
	// `args` satisfies the component's prop types for CSF3; the actual values
	// come from the real hooks in `render` below.
	args: {
		draft: { articleUrl: '', kicker: 'none', subject: '', previewText: '' },
		onArticleUrlChange: () => {},
		onKickerChange: () => {},
		onSubjectChange: () => {},
		onPreviewTextChange: () => {},
		onSend: () => {},
		isSending: false,
		sendSucceeded: false,
	},
	render: function Render() {
		const { draft, ...draftActions } = useNotificationDraft();
		const sendNotification = useSendNotification();

		return (
			<CreateNotificationForm
				draft={draft}
				onArticleUrlChange={draftActions.setArticleUrl}
				onKickerChange={draftActions.setKicker}
				onSubjectChange={draftActions.setSubject}
				onPreviewTextChange={draftActions.setPreviewText}
				onSend={() =>
					sendNotification.mutate(
						buildDryRunNotificationRequest(draftActions.idempotencyKey, draft),
						{ onSuccess: draftActions.rotateIdempotencyKey },
					)
				}
				isSending={sendNotification.isPending}
				sendSucceeded={sendNotification.isSuccess}
				sendErrorMessage={sendNotification.error?.message}
			/>
		);
	},
} satisfies Meta<typeof CreateNotificationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Create a Notification')).toBeInTheDocument();
		await expect(canvas.getByLabelText('Article')).toBeInTheDocument();
		await expect(canvas.getByText('Kicker')).toBeInTheDocument();
		await expect(canvas.getByLabelText('Subject')).toBeInTheDocument();
		await expect(canvas.getByLabelText('Preview text')).toBeInTheDocument();
	},
};

export const ValidationSuccess: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(
			canvas.getByLabelText('Article'),
			'https://www.theguardian.com/world/2026/jul/22/example',
		);
		await userEvent.type(canvas.getByLabelText('Subject'), 'Breaking news');
		await userEvent.type(canvas.getByLabelText('Preview text'), 'Preview text');
		await userEvent.click(
			canvas.getByRole('button', { name: /validate example/i }),
		);
		await expect(
			await canvas.findByText('Example accepted by backend.'),
		).toBeInTheDocument();
	},
};

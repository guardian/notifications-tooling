import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import { CreateNotificationForm } from './CreateNotificationForm';

const meta = {
	title: 'Stand Frontend/CreateNotificationForm',
	component: CreateNotificationForm,
	args: {
		selectedSegments: [],
		onSelectedSegmentsChange: () => {},
		selectedChannel: undefined,
		onSelectedChannelChange: () => {},
		selectedDeliveryTiming: undefined,
		onSelectedDeliveryTimingChange: () => {},
	},
	parameters: {
		docs: {
			description: {
				component:
					'Notification creation form with audience segments, channel, and delivery timing controls.',
			},
		},
	},
} satisfies Meta<typeof CreateNotificationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const CreateNewNotification = () => {
	const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string | undefined>();
	const [selectedDeliveryTiming, setSelectedDeliveryTiming] = useState<
		string | undefined
	>();

	return (
		<CreateNotificationForm
			selectedSegments={selectedSegments}
			onSelectedSegmentsChange={setSelectedSegments}
			selectedChannel={selectedChannel}
			onSelectedChannelChange={setSelectedChannel}
			selectedDeliveryTiming={selectedDeliveryTiming}
			onSelectedDeliveryTimingChange={setSelectedDeliveryTiming}
		/>
	);
};
export const Default: Story = {
	render: () => <CreateNewNotification />,

	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Create a Notification')).toBeInTheDocument();
		await expect(canvas.getByText('Article')).toBeInTheDocument();
		await expect(canvas.getByText('Kicker')).toBeInTheDocument();
		await expect(canvas.getByText('Subject')).toBeInTheDocument();
		await expect(canvas.getByText('Preview text')).toBeInTheDocument();
		await expect(canvas.getByText('Audience Segments')).toBeInTheDocument();
		await expect(canvas.getByText('Channel')).toBeInTheDocument();
		await expect(canvas.getByText('Delivery and timing')).toBeInTheDocument();
	},
};

import { semanticSpacing } from '@guardian/stand';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { AudienceSegments } from './AudienceSegments';
import { ChannelSelector } from './ChannelSelector';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';

interface CreateNotificationFormProps {
	selectedSegments: string[];
	onSelectedSegmentsChange: (selected: string[]) => void;
	selectedChannel?: string;
	onSelectedChannelChange: (channel?: string) => void;
	selectedDeliveryTiming?: string;
	onSelectedDeliveryTimingChange: (deliveryTiming?: string) => void;
}

/**
 * This is a non-functional placeholder to demonstrate how content will appear in the layout
 */
export const CreateNotificationForm = ({
	selectedSegments,
	onSelectedSegmentsChange,
	selectedChannel,
	onSelectedChannelChange,
	selectedDeliveryTiming,
	onSelectedDeliveryTimingChange,
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
				/>
				<ChannelSelector
					selectedChannel={selectedChannel}
					onChange={onSelectedChannelChange}
				/>
				<Select
					label="Kicker"
					description="Choose the kicker for the email newsletter"
				>
					<Option>Breaking News</Option>
					<Option>Exclusive</Option>
					<Option>None</Option>
				</Select>

				<TextInput
					label="Subject"
					description="The kicker counts towards the character limit of the subject"
				/>

				<TextInput
					label="Preview text"
					description="Choose the preview text for the email newsletter"
				/>
				<AudienceSegments
					selected={selectedSegments}
					onChange={onSelectedSegmentsChange}
				/>
				<DeliveryAndTimingSelector
					selectedDeliveryTiming={selectedDeliveryTiming}
					onChange={onSelectedDeliveryTimingChange}
				/>
			</div>
		</>
	);
};

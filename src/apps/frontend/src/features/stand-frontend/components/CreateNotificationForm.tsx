import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { ArticleImportControl } from './ArticleImportControl';
import { AudienceSegments } from './AudienceSegments';
import { ChannelOptions } from './ChannelOptions';
import { ChannelSelector } from './ChannelSelector';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
import { EmailFields } from './EmailFields';
import { SendButton } from './SendButton';

export interface CreateNotificationFormProps {
	selectedSegments: string[];
	onSelectedSegmentsChange: (selected: string[]) => void;
	selectedChannel?: string;
	onSelectedChannelChange: (channel?: string) => void;
	selectedDeliveryTiming?: string;
	onSelectedDeliveryTimingChange: (deliveryTiming?: string) => void;
}

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
			<Typography variant="heading2Xl" element="h2">
				Create a Notification
			</Typography>

			<div
				css={{
					marginTop: semanticSpacing.stackXl,
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
				}}
			>
				<ArticleImportControl />
				<ChannelOptions />

				<ChannelSelector
					selectedChannel={selectedChannel}
					onChange={onSelectedChannelChange}
				/>

				<EmailFields />

				<AudienceSegments
					selected={selectedSegments}
					onChange={onSelectedSegmentsChange}
				/>
				<DeliveryAndTimingSelector
					selectedDeliveryTiming={selectedDeliveryTiming}
					onChange={onSelectedDeliveryTimingChange}
				/>

				<SendButton />
			</div>
		</>
	);
};

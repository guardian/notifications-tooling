import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { useState } from 'react';
import { CreateNotificationForm } from './CreateNotificationForm';
import { EmailPreviewSection } from './EmailPreviewSection';
import { SideNavigationPanel } from './SideNavigationPanel';

export const DispatchTab = () => {
	const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string | undefined>();
	const [selectedDeliveryTiming, setSelectedDeliveryTiming] = useState<
		string | undefined
	>();

	return (
		<Layout.Main
			theme={{
				sm: { padding: { top: '0px', bottom: '0px' } },
				md: { padding: { top: '0px', bottom: '0px' } },
				lg: { padding: { top: '0px', bottom: '0px' } },
			}}
		>
			<Grid
				cssOverrides={css({
					height: '100%',
				})}
				theme={{
					sm: { gap: '0px', padding: `0px 0px 0px` },
					md: { gap: '0px', padding: `0px 0px 0px` },
					lg: { gap: '0px', padding: `0px 0px 0px` },
				}}
			>
				<Item
					size={2}
					cssOverrides={css({
						border: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
						gap: `${baseSpacing['10Px']}`,
					})}
				>
					<SideNavigationPanel />
				</Item>

				<Item
					size={5}
					cssOverrides={css({
						paddingLeft: '147px',
						paddingRight: semanticSpacing.stackXl,
						borderRightWidth: semanticSizing.border.default,
						borderRightStyle: 'solid',
						borderRightColor: semanticColors.border.weak,
						paddingTop: `48px`,
						width: '720px',
					})}
				>
					<CreateNotificationForm
						selectedSegments={selectedSegments}
						onSelectedSegmentsChange={setSelectedSegments}
						selectedChannel={selectedChannel}
						onSelectedChannelChange={setSelectedChannel}
						selectedDeliveryTiming={selectedDeliveryTiming}
						onSelectedDeliveryTimingChange={setSelectedDeliveryTiming}
					/>
				</Item>
				<Item
					size={4}
					cssOverrides={css({
						paddingRight: semanticSpacing.stackSm,
						paddingLeft: semanticSpacing.stackSm,
						paddingTop: semanticSpacing.stackSm,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'flex-start',
					})}
				>
					<EmailPreviewSection
						selectedSegments={selectedSegments}
						selectedChannel={selectedChannel}
						selectedDeliveryTiming={selectedDeliveryTiming}
					/>
				</Item>
			</Grid>
		</Layout.Main>
	);
};

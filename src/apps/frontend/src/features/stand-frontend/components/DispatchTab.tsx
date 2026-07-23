import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { useContext, useState } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import { CreateNotificationForm } from './CreateNotificationForm';
import { DispatchReport } from './DispatchReport';
import { EmailPreviewSection } from './EmailPreviewSection';

export const DispatchTab = () => {
	const {
		notification: { sendingResult },
	} = useContext(NotificationFormContext);
	const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string | undefined>();
	const [selectedDeliveryTiming, setSelectedDeliveryTiming] = useState<
		string | undefined
	>();

	return (
		<Layout.Main theme={layoutMainTheme}>
			<Grid
				cssOverrides={css({
					height: '100%',
				})}
				theme={{
					sm: { gap: '0px', padding: `0px 0px 0px` },
					md: { gap: '0px', padding: `0px 0px ${semanticSpacing.stackLg}` },
					lg: { gap: '0px', padding: `0px 0px ${semanticSpacing.stackXl}` },
				}}
			>
				{sendingResult ? (
					<Item
						size={12}
						cssOverrides={css({
							paddingTop: semanticSpacing.stackXl,
							paddingLeft: semanticSpacing.stackLg,
							paddingRight: semanticSpacing.stackLg,
						})}
					>
						<DispatchReport />
					</Item>
				) : (
					<>
						<Item
							size={8}
							cssOverrides={css({
								paddingLeft: semanticSpacing.stackSm,
								paddingRight: semanticSpacing.stackSm,
								borderRightWidth: semanticSizing.border.default,
								borderRightStyle: 'solid',
								borderRightColor: semanticColors.border.weak,
								paddingTop: semanticSpacing.stackSm,
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
					</>
				)}
			</Grid>
		</Layout.Main>
	);
};

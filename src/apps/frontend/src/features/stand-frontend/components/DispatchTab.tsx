import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import { CreateNotificationForm } from './CreateNotificationForm';
import { DispatchReport } from './DispatchReport';
import { EmailPreviewSection } from './EmailPreviewSection';
import { SideNavigationPanel } from './SideNavigationPanel';

export const DispatchTab = () => {
	const {
		notification: { sendingResult, parameters },
	} = useContext(NotificationFormContext);

	return (
		<Layout.Main theme={layoutMainTheme}>
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
							size={'auto'}
							cssOverrides={css({
								border: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
								gap: `${baseSpacing['10Px']}`,
							})}
						>
							<SideNavigationPanel />
						</Item>
						<Item
							size={'auto'}
							cssOverrides={css({
								borderRightWidth: semanticSizing.border.default,
								borderRightStyle: 'solid',
								borderRightColor: semanticColors.border.weak,
							})}
						>
							<CreateNotificationForm />
						</Item>
						<Item
							size={'auto'}
							cssOverrides={css({
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'flex-start',
								flow: 'vertical',
								width: '621px',
							})}
						>
							<EmailPreviewSection
								selectedSegments={parameters?.audienceSegments ?? []}
								selectedChannel={parameters?.type}
								selectedDeliveryTiming={
									parameters?.type === 'email'
										? parameters.emailDeliveryOption
										: undefined
								}
							/>
						</Item>
					</>
				)}
			</Grid>
		</Layout.Main>
	);
};

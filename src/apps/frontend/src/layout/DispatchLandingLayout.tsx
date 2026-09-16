import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import { layoutMainTheme } from '../themes';
import { DispatchLandingTab } from './DispatchLandingTab';
import { LatestPublishedContent } from './LatestPublishedContent';

export const DispatchLandingLayout = () => {
	return (
		<>
			<Layout.Main theme={layoutMainTheme}>
				<Grid
					cssOverrides={css({
						height: '100%',
						[from.lg]: {
							flexWrap: 'nowrap',
						},
					})}
					theme={{
						sm: { gap: '0px', padding: `0px 0px 0px` },
						md: { gap: '0px', padding: `0px 0px 0px` },
						lg: { gap: '0px', padding: `0px 0px 0px` },
					}}
				>
					<>
						<Item
							size={{ sm: 12, md: 12, lg: 8 }}
							cssOverrides={css({
								maxWidth: '1056px',
								minWidth: 0,
							})}
						>
							<DispatchLandingTab />
						</Item>
						<Item
							size={{ sm: 12, md: 12, lg: 4 }}
							cssOverrides={css({
								justifyContent: 'center',
								alignItems: 'flex-start',
								backgroundColor: semanticColors.bg.raisedLevel1,
								flow: 'vertical',
								[from.lg]: {
									display: 'flex',
									flex: '0 0 474px',
									marginLeft: 'auto',
									maxWidth: '474px',
								},
							})}
						>
							<LatestPublishedContent />
						</Item>
					</>
				</Grid>
			</Layout.Main>
		</>
	);
};

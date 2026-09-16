import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
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
						'@media (min-width: 1310px)': {
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
							size={'grow'}
							cssOverrides={css({
								maxWidth: '826px',
								minWidth: 0,
							})}
						>
							<DispatchLandingTab />
						</Item>
						<Item
							size={'grow'}
							cssOverrides={css({
								display: 'none',
								justifyContent: 'center',
								alignItems: 'flex-start',
								backgroundColor: semanticColors.bg.raisedLevel1,
								flow: 'vertical',
								['@media (min-width: 1310px)']: {
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

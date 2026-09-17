import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { DispatchLandingPage } from '../compose/DispatchLandingPage';
import { ConfigContext } from '../config/ConfigContext';
import { layoutMainTheme } from '../themes';
import { LatestPublishedContent } from './LatestPublishedContent';

export const DispatchLandingLayout = () => {
	const config = useContext(ConfigContext);
	const shouldShowLatestPublishedContent = config?.stage !== 'PROD';

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
							size={12}
							cssOverrides={css({
								minWidth: 0,
								[from.lg]: {
									flex: shouldShowLatestPublishedContent
										? '1 1 1056px'
										: '1 1 100%',
									maxWidth: shouldShowLatestPublishedContent
										? '1056px'
										: 'none',
								},
							})}
						>
							<DispatchLandingPage />
						</Item>
						{shouldShowLatestPublishedContent && (
							<Item
								size={12}
								cssOverrides={css({
									justifyContent: 'center',
									alignItems: 'flex-start',
									backgroundColor: semanticColors.bg.raisedLevel1,
									flow: 'vertical',
									minWidth: 0,
									[from.lg]: {
										display: 'flex',
										flex: '0 1 474px',
										marginLeft: 'auto',
										maxWidth: '474px',
									},
								})}
							>
								<LatestPublishedContent />
							</Item>
						)}
					</>
				</Grid>
			</Layout.Main>
		</>
	);
};

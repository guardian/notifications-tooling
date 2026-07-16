import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';

export const DispatchTab = () => {
	return (
		<Layout.Main
			theme={{
				sm: { padding: { top: '0px' } },
				md: { padding: { top: '0px' } },
				lg: { padding: { top: '0px' } },
			}}
		>
			<Grid
				theme={{
					sm: { gap: '0px' },
					md: { gap: '0px' },
					lg: { gap: '0px' },
				}}
			>
				<Item
					size={8}
					cssOverrides={css({
						borderRightWidth: 1,
						borderRightStyle: 'solid',
						borderRightColor: semanticColors.border.weak,
						marginRight: 10,
					})}
				>
					<Typography variant="headingCompactMd" element="h2">
						Create a Notification
					</Typography>

					<Typography element="div" variant="headingCompactXs">
						Article
					</Typography>
					<Typography element="div" variant="headingCompactXs">
						Channel
					</Typography>
					<Typography element="div" variant="headingCompactXs">
						Kicker
					</Typography>
					<Typography element="div" variant="headingCompactXs">
						Subject
					</Typography>
					<Typography element="div" variant="headingCompactXs">
						Preview text
					</Typography>
				</Item>
				<Item size={4}>Preview</Item>
			</Grid>
		</Layout.Main>
	);
};

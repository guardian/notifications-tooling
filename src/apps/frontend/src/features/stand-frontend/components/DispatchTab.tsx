import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { useState } from 'react';
import { CreateNotificationForm } from './CreateNotificationForm';
import { EmailPreviewSection } from './EmailPreviewSection';

export const DispatchTab = () => {
	const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

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
					md: { gap: '0px', padding: `0px 0px ${semanticSpacing.stackLg}` },
					lg: { gap: '0px', padding: `0px 0px ${semanticSpacing.stackXl}` },
				}}
			>
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
						onSelectedSegmentsChange={setSelectedSegments}
					/>
				</Item>
			</Grid>
		</Layout.Main>
	);
};

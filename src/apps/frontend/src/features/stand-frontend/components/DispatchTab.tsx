import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';

export const DispatchTab = () => {
	return (
		<Layout.Main
			theme={{
				sm: { padding: { top: '0px', bottom: '0px' } },
				md: { padding: { top: '0px', bottom: '0px' } },
				lg: { padding: { top: '0px', bottom: '0px' } },
			}}
		>
			<Grid
				cssOverrides={css({ height: '100%' })}
				theme={{
					sm: { gap: '0px' },
					md: { gap: '0px' },
					lg: { gap: '0px' },
				}}
			>
				<Item
					size={8}
					cssOverrides={css({
						borderRightWidth: semanticSizing.border.default,
						borderRightStyle: 'solid',
						borderRightColor: semanticColors.border.weak,
						marginRight: semanticSpacing.stackSm,
						paddingTop: semanticSpacing.stackSm,
					})}
				>
					<Typography variant="titleMd" element="h2">
						Create a Notification
					</Typography>

					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: semanticSpacing.stackLg,
						}}
					>
						<TextInput
							label="Article"
							description="Copy and paste a Guardian URL below"
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
					</div>
				</Item>
				<Item size={4}>Preview</Item>
			</Grid>
		</Layout.Main>
	);
};

import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { AudienceSegments } from './AudienceSegments';
import { HTMLPreview } from './HTMLPreview';
import { RoutingType } from './RoutingType';


const customStyles = css`
	display: flex;
	width: 50%;
	height: 40px;
	radius: 4px;
	justify-content: center;
	align-items: center;
	gap: '8px';
	padding: 6px baseSpacing['12Px'] 7px baseSpacing['12Px'];
`;

export const EmailPreviewSection = () => {
	return (
		<section
			css={css({
				background: semanticColors.fill.neutralWeak,
				flexBasis: 474,
				padding: baseSpacing['16Px'],
				display: 'flex',
				flexDirection: 'column',
				gap: baseSpacing['20Px'],
			})}
		>
			<header
				css={css({
					display: 'flex',
					flexDirection: 'column',
					gap: baseSpacing['12Px'], // adjust spacing as needed
					alignItems: 'stretch',
				})}
			>
				<div
					css={{
						display: 'flex',
						alignItems: 'center',
						gap: 5,
					}}
				>
					<Icon symbol="preview" />
					<Typography variant="headingCompactLg">Preview</Typography>
				</div>
				<Typography variant="bodySm">
					The preview for the newsletter email and/or the app alert notification
					will be shown below.
				</Typography>
				<HTMLPreview />
				<RoutingType />
				<AudienceSegments />
				<Typography variant="headingCompactLg">Test send</Typography>
				<TextInput
					description="Enter your email to send a test"
					placeholder="name@theguardian.com"
				/>
				<Typography variant="bodyCompactSm">
					Sends test only to the email address above, on the enabled channels —
					audience segments and timing are ignored.
				</Typography>
				<Button variant="primary" size="sm" cssOverrides={customStyles}>
					Send test notification
				</Button>
			</header>
		</section>
	);
};

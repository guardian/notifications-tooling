import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { GuardianLogo } from '../layout/GuardianLogo';
import {
	type AlertPreviewProps,
	DEFAULT_ALERT_TYPE,
	DEFAULT_HEADLINE,
	DeviceAlertPreview,
} from './DeviceAlertPreview';

export const IPhoneAlertPreview = ({
	alertType = DEFAULT_ALERT_TYPE,
	headline = DEFAULT_HEADLINE,
	thumbnailUrl,
}: AlertPreviewProps) => (
	<DeviceAlertPreview platform="Apple">
		<div
			css={css({
				backgroundColor: 'rgba(255, 255, 255, 0.1)',
				border: '1px solid rgba(255, 255, 255, 0.22)',
				borderRadius: 24,
				boxShadow:
					'0 8px 24px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				boxSizing: 'border-box',
				display: 'grid',
				gridTemplateColumns: `34px minmax(0, 1fr) ${thumbnailUrl ? '32px' : 'auto'}`,
				gap: 9,
				maxWidth: 353,
				padding: 12,
				width: '68.5%',
			})}
			aria-label="iPhone notification preview"
			role="img"
		>
			<GuardianLogo
				size={34}
				borderRadius={9}
				boxShadow="0 1px 3px rgba(0, 0, 0, 0.4)"
			/>

			<div
				css={css({
					display: 'flex',
					flexDirection: 'column',
					minWidth: 0,
				})}
			>
				<Typography
					variant="bodyBoldSm"
					cssOverrides={css({
						color: semanticColors.text.strongInverse,
						marginBottom: 3,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					})}
				>
					{alertType}
				</Typography>
				<Typography
					element="p"
					variant="bodySm"
					cssOverrides={css({
						color: semanticColors.text.strongInverse,
						display: '-webkit-box',
						margin: 0,
						overflow: 'hidden',
						WebkitBoxOrient: 'vertical',
						WebkitLineClamp: 3,
					})}
				>
					{headline}
				</Typography>
			</div>

			<div
				css={css({
					alignItems: 'flex-end',
					display: 'flex',
					flexDirection: 'column',
					gap: 5,
				})}
			>
				<Typography
					variant="bodyXs"
					cssOverrides={css({
						color: semanticColors.text.weakInverse,
						lineHeight: 1,
					})}
				>
					now
				</Typography>
				{thumbnailUrl && (
					<img
						src={thumbnailUrl}
						alt="Article thumbnail"
						css={css({
							borderRadius: 4,
							height: 32,
							objectFit: 'cover',
							width: 32,
						})}
					/>
				)}
			</div>
		</div>
	</DeviceAlertPreview>
);

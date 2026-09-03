import { css } from '@emotion/react';
import { baseColors, semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { GuardianLogo } from '../layout/GuardianLogo';
import {
	type AlertPreviewProps,
	DEFAULT_ALERT_TYPE,
	DEFAULT_HEADLINE,
	DeviceAlertPreview,
} from './DeviceAlertPreview';

export const AndroidAlertPreview = ({
	alertType = DEFAULT_ALERT_TYPE,
	headline = DEFAULT_HEADLINE,
	thumbnailUrl,
}: AlertPreviewProps) => (
	<DeviceAlertPreview platform="Android">
		<div
			css={css({
				backgroundColor: semanticColors.bg.base,
				borderRadius: 12,
				boxShadow: '0 4px 16px rgba(0, 0, 0, 0.22)',
				boxSizing: 'border-box',
				maxWidth: 307,
				padding: 14,
				width: '68.5%',
			})}
			aria-label="Android notification preview"
			role="img"
		>
			<div
				css={css({
					alignItems: 'center',
					display: 'flex',
					gap: 6,
					marginBottom: 9,
				})}
			>
				<GuardianLogo size={12} />
				<Typography
					variant="bodyXs"
					cssOverrides={css({ color: baseColors.blue[500] })}
				>
					Guardian
				</Typography>
				<Typography
					variant="bodyXs"
					cssOverrides={css({ color: semanticColors.text.weak })}
				>
					· now
				</Typography>
			</div>
			<div
				css={css({
					display: 'grid',
					gap: 10,
					gridTemplateColumns: thumbnailUrl
						? 'minmax(0, 1fr) 32px'
						: 'minmax(0, 1fr)',
				})}
			>
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
							color: semanticColors.text.strong,
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
							color: semanticColors.text.weak,
							display: '-webkit-box',
							margin: 0,
							overflow: 'hidden',
							WebkitBoxOrient: 'vertical',
							WebkitLineClamp: 2,
						})}
					>
						{headline}
					</Typography>
				</div>
				{thumbnailUrl && (
					<img
						src={thumbnailUrl}
						alt="Android article thumbnail"
						css={css({
							alignSelf: 'center',
							borderRadius: 2,
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

import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import guardianLogo from '../assets/guardian-logo.png';

const DEFAULT_ALERT_TYPE = 'Breaking news';
const DEFAULT_HEADLINE =
	'Global leaders gather for emergency talks as major agreement is announced';
const DEFAULT_THUMBNAIL_URL =
	'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg';

interface IPhoneAlertPreviewProps {
	alertType?: string;
	headline?: string;
	thumbnailUrl?: string;
}

export const IPhoneAlertPreview = ({
	alertType = DEFAULT_ALERT_TYPE,
	headline = DEFAULT_HEADLINE,
	thumbnailUrl = DEFAULT_THUMBNAIL_URL,
}: IPhoneAlertPreviewProps) => (
	<div
		css={css({
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
		})}
	>
		<Typography variant="bodyBoldSm">Apple</Typography>
		<div
			css={css({
				alignItems: 'center',
				aspectRatio: '448 / 176',
				backgroundColor: semanticColors.bg.raisedLevel3Inverse,
				display: 'flex',
				justifyContent: 'center',
			})}
		>
			<div
				css={css({
					backgroundColor: 'rgba(255, 255, 255, 0.1)',
					border: '1px solid rgba(255, 255, 255, 0.22)',
					borderRadius: 24,
					boxShadow:
						'0 8px 24px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
					boxSizing: 'border-box',
					display: 'grid',
					gridTemplateColumns: '34px minmax(0, 1fr) 28px',
					gap: 9,
					maxWidth: 353,
					padding: 12,
					width: '68.5%',
				})}
				aria-label="iPhone notification preview"
				role="img"
			>
				<img
					src={guardianLogo}
					alt=""
					css={css({
						alignSelf: 'center',
						borderRadius: 9,
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
						height: 34,
						width: 34,
					})}
					aria-hidden="true"
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
					<img
						src={thumbnailUrl}
						alt="Article thumbnail"
						css={css({
							borderRadius: 4,
							height: 28,
							objectFit: 'cover',
							width: 28,
						})}
					/>
				</div>
			</div>
		</div>
	</div>
);

import { css } from '@emotion/react';
import { baseColors, semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';

const DEFAULT_ALERT_TYPE = 'Breaking news';
const DEFAULT_HEADLINE =
	'Global leaders gather for emergency talks as major agreement is announced';
const DEFAULT_THUMBNAIL_URL =
	'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg';

interface AndroidAlertPreviewProps {
	alertType?: string;
	headline?: string;
	thumbnailUrl?: string;
}

export const AndroidAlertPreview = ({
	alertType = DEFAULT_ALERT_TYPE,
	headline = DEFAULT_HEADLINE,
	thumbnailUrl = DEFAULT_THUMBNAIL_URL,
}: AndroidAlertPreviewProps) => (
	<div css={css({ display: 'flex', flexDirection: 'column', gap: 8 })}>
		<Typography variant="bodyBoldSm">Android</Typography>
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
					backgroundColor: semanticColors.bg.raisedLevel1Inverse,
					borderRadius: 12,
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.22)',
					boxSizing: 'border-box',
					maxWidth: 307,
					padding: 14,
					width: '68.5%',
				})}
				aria-label="Android notification preview"
			>
				<div
					css={css({
						alignItems: 'center',
						display: 'flex',
						gap: 6,
						marginBottom: 9,
					})}
				>
					<div
						css={css({
							alignItems: 'center',
							backgroundColor: '#052962',
							color: semanticColors.text.strongerInverse,
							display: 'flex',
							fontFamily: 'Georgia, serif',
							fontSize: 9,
							fontWeight: 700,
							height: 12,
							justifyContent: 'center',
							width: 12,
						})}
						aria-hidden="true"
					>
						G
					</div>
					<Typography
						variant="bodyXs"
						cssOverrides={css({ color: baseColors.blue[700] })}
					>
						Guardian
					</Typography>
					<Typography
						variant="bodyXs"
						cssOverrides={css({ color: semanticColors.text.weakInverse })}
					>
						· now
					</Typography>
				</div>
				<div
					css={css({
						display: 'grid',
						gap: 10,
						gridTemplateColumns: 'minmax(0, 1fr) 32px',
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
								color: semanticColors.text.strongerInverse,
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
								color: semanticColors.text.weakInverse,
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
				</div>
			</div>
		</div>
	</div>
);

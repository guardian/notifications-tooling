import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';

export const DEFAULT_ALERT_TYPE = 'Breaking news';
export const DEFAULT_HEADLINE =
	'Global leaders gather for emergency talks as major agreement is announced';

export interface AlertPreviewProps {
	alertType?: string;
	headline?: string;
	thumbnailUrl?: string;
}

interface DeviceAlertPreviewProps {
	children: ReactNode;
	platform: string;
}

export const DeviceAlertPreview = ({
	children,
	platform,
}: DeviceAlertPreviewProps) => (
	<figure css={css({ display: 'flex', flexDirection: 'column', gap: 8 })}>
		<Typography variant="bodyBoldSm" element="figcaption">
			{platform}
		</Typography>
		<div
			css={css({
				alignItems: 'center',
				aspectRatio: '448 / 176',
				backgroundColor: semanticColors.bg.raisedLevel3Inverse,
				display: 'flex',
				justifyContent: 'center',
			})}
		>
			{children}
		</div>
	</figure>
);

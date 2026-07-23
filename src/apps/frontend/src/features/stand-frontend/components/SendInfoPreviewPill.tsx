import { semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { activePillTheme } from '../themes';

interface SendInfoPreviewPillProps {
	channel?: string;
	deliveryTiming?: string;
}

// TO DO - derive from constants
const getLabel = (value: string) => {
	switch (value) {
		case 'immediate':
			return 'Immediate send';
		case 'email':
			return 'Email newsletter';
	}

	return value;
};

export const SendInfoPreviewPill = ({
	channel,
	deliveryTiming,
}: SendInfoPreviewPillProps) => {
	const selectedValues = [channel, deliveryTiming].filter(
		(value): value is string => Boolean(value),
	);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Send info</Typography>

			{selectedValues.length > 0 && (
				<div
					css={{
						display: 'flex',
						flexDirection: 'row',
						gap: semanticSpacing.stackSm,
					}}
				>
					{selectedValues.map((value) => {
						const iconValue = value === 'immediate' ? 'bolt' : 'mail';
						return (
							<div key={value} css={activePillTheme.activePill}>
								<Icon
									size="md"
									symbol={iconValue}
									alt="send info"
									cssOverrides={activePillTheme.activePillIcon}
								/>
								<Typography variant={'headingCompactSm'}>
									{getLabel(value)}
								</Typography>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

import { css } from '@emotion/react';
import { baseColors, semanticSpacing } from '@guardian/stand';
import { formatLocalSendTimes } from '../utils/history-send-time';
import { Tooltip } from './Tooltip';

const styles = {
	list: css({
		display: 'grid',
		gridTemplateColumns: 'auto auto',
		columnGap: semanticSpacing.stackXs,
		margin: 0,
		padding: 0,
		listStyle: 'none',
		whiteSpace: 'nowrap',
	}),
	listItem: css({
		display: 'contents',
	}),
};

export const SendTimeTooltip = ({ sentAt }: { sentAt: string }) => {
	const localSendTimes = formatLocalSendTimes(sentAt);

	if (localSendTimes.length === 0) {
		return null;
	}

	return (
		<Tooltip
			label="Local send times"
			theme={{
				backgroundColor: baseColors.magenta[800],
				triggerColor: baseColors.magenta[800],
			}}
		>
			<ul css={styles.list}>
				{localSendTimes.map(({ region, time }) => (
					<li key={region} css={styles.listItem}>
						<span>{region}</span>
						<span>{time}</span>
					</li>
				))}
			</ul>
		</Tooltip>
	);
};

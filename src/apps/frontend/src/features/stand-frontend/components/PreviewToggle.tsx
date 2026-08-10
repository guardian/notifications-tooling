import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useState } from 'react';
import type {
    AudienceSegment,
    ChannelOption,
    EmailDeliveryOption,
} from '../types';
import { EmailPreviewSection } from './EmailPreviewSection';

interface PreviewToggleProps {
    selectedSegments: AudienceSegment[];
    selectedChannel?: ChannelOption;
    selectedDeliveryTiming?: EmailDeliveryOption;
}

export const PreviewToggle = ({
    selectedSegments,
    selectedChannel,
    selectedDeliveryTiming,
}: PreviewToggleProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            css={css({
                display: 'flex',
                flexDirection: 'column',
                [from.lg]: {
                    display: 'none',
                },
            })}
        >
            <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((expanded) => !expanded)}
                css={css({
                    alignItems: 'center',
                    background: semanticColors.bg.raisedLevel1,
                    border: 0,
                    color: semanticColors.text.strong,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: semanticSpacing.stackSm,
                    width: '100%',
                })}
            >
                <Typography variant="bodyBoldMd">Preview</Typography>
                <Icon
                    symbol={
                        isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                    }
                />
            </button>

            {isExpanded && (
                <EmailPreviewSection
                    selectedSegments={selectedSegments}
                    selectedChannel={selectedChannel}
                    selectedDeliveryTiming={selectedDeliveryTiming}
                />
            )}
        </div>
    );
};
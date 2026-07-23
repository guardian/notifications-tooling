import type { Icon } from '@guardian/stand/Icon';
import type { ComponentProps } from 'react';
import type { AudienceSegment, EmailDeliveryOption, KickerId } from './types';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];

export const channelOptionNameMap: Record<
	'email', // for phase one, email is the only supported channel
	{
		name: string;
		description: string;
		symbol?: IconSymbol;
	}
> = {
	email: {
		name: 'Newsletter email',
		description: 'Sends via the braze breaking-news campaign',
		symbol: 'mail',
	},
};

export const kickerNameMap: Record<KickerId | 'undefined', string> = {
	'breaking-news': 'Breaking News',
	exclusive: 'Exclusive',
	undefined: 'None',
};

export const audienceSegmentNameMap: Record<AudienceSegment, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
};

export const emailDeliveryOptionNameMap: Record<
	EmailDeliveryOption,
	{ name: string; description: string; symbol?: IconSymbol }
> = {
	immediate: {
		name: 'Immediate',
		description: 'Sends right now via Braze',
		symbol: 'bolt',
	},
};

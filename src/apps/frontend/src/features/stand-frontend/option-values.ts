import type { Icon } from '@guardian/stand/Icon';
import type { ComponentProps } from 'react';
import type { AudienceSegment, EmailDeliveryOption, KickerId } from './types';
import type { ChannelOption } from './types';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];

export type ChannelParams = {
	name: string;
	description: string;
	symbol?: IconSymbol;
};

export const channelOptionNameMap: Record<ChannelOption, ChannelParams> = {
	email: {
		name: 'Newsletter email',
		description: 'Sends via the braze breaking-news campaign',
		symbol: 'mail',
	},
	push: {
		name: 'App alert',
		description: 'Push notification to Guardian app users',
		symbol: 'mobile_3',
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

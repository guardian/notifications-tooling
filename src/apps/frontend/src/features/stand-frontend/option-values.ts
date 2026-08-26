import type { Icon } from '@guardian/stand/Icon';
import type { NewsletterSegmentId } from '@models';
import type { ComponentProps } from 'react';
import type { Kicker } from './api/schemas';
import type { AlertType, ChannelOption, DeliveryOption } from './types';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];

type OptionDisplayInfo = {
	name: string;
	description: string;
	symbol?: IconSymbol;
};

export const channelOptionNameMap: Record<ChannelOption, OptionDisplayInfo> = {
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

export const kickerNameMap: Record<Kicker, string> = {
	'breaking-news': 'Breaking News',
	exclusive: 'Exclusive',
	none: 'None',
};

export const alertTypeNameMap: Record<AlertType | 'undefined', string> = {
	'breaking-news': 'Breaking News',
	sport: 'Sport',
	'editors-picks': 'Editors’ Picks',
	'one-not-to-miss': 'One Not to Miss',
	undefined: 'None',
};

export const audienceSegmentNameMap: Record<NewsletterSegmentId, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
};

export const deliveryOptionNameMap: Record<DeliveryOption, OptionDisplayInfo> =
	{
		immediate: {
			name: 'Immediate',
			description: 'Sends right now via Braze',
			symbol: 'bolt',
		},
		appImmediate: {
			name: 'Immediate',
			description: 'Sends right now',
			symbol: 'bolt',
		},
	};

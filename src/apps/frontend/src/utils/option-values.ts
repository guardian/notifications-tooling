import type { Icon } from '@guardian/stand/Icon';
import type { ComponentProps, ReactNode } from 'react';
import type { Kicker } from '../schemas';
import type { ChannelOption, DeliveryOption } from '../types';
import { phoneIphoneIcon } from '../ui/FlagIcons';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];

type OptionDisplayInfo = {
	name: string;
	description: string;
	symbol?: IconSymbol;
	customIcon?: ReactNode;
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
		customIcon: phoneIphoneIcon,
	},
};

export const kickerNameMap: Record<Kicker, string> = {
	'breaking-news': 'Breaking News',
	exclusive: 'Exclusive',
	none: 'None',
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

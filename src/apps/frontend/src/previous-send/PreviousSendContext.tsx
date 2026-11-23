import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useState } from 'react';
import type { ChannelOption } from '../types';

export type PreviousSendContextData = {
	notificationId?: string;
	channel: ChannelOption;
};
type PreviousSendContextProps = {
	previousSend?: PreviousSendContextData;
	setPreviousSend: Dispatch<
		SetStateAction<PreviousSendContextData | undefined>
	>;
};

export const PreviousSendContext = createContext<PreviousSendContextProps>({
	setPreviousSend: () => {},
});

export const PreviousSendProvider = ({ children }: { children: ReactNode }) => {
	const [previousSend, setPreviousSend] = useState<PreviousSendContextData>();

	return (
		<PreviousSendContext.Provider value={{ previousSend, setPreviousSend }}>
			{children}
		</PreviousSendContext.Provider>
	);
};

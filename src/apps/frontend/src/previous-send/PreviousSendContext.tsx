import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
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

export const PreviousSendProvider = ({
	children,
	initialState,
}: {
	children: ReactNode;
	initialState?: PreviousSendContextData;
}) => {
	const [previousSend, setPreviousSend] = useState<
		PreviousSendContextData | undefined
	>(initialState);

	return (
		<PreviousSendContext.Provider value={{ previousSend, setPreviousSend }}>
			{children}
		</PreviousSendContext.Provider>
	);
};

export const useClearPreviousSend = () => {
	const { setPreviousSend } = useContext(PreviousSendContext);
	return useCallback(() => setPreviousSend(undefined), [setPreviousSend]);
};

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { TelemetryEvent, TelemetryService } from './telemetryService';

export const TelemetryContext = createContext<TelemetryService>(
	new TelemetryService('no-session', 'DEV'),
);

export const TelemetryServiceProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const appConfig = useContext(ConfigContext);

	const [telemetryService] = useState(
		new TelemetryService(
			appConfig?.sessionId ?? 'no-session',
			appConfig?.stage ?? 'DEV',
		),
	);

	return (
		<TelemetryContext.Provider value={telemetryService}>
			{children}
		</TelemetryContext.Provider>
	);
};

/**
 * returns a function that return the `href` and `onPress` props for a pressable component
 * to navigate to the given `path` and queue the telemetry event
 */
export const useTelemetryBeforeInternalLink = (component: string) => {
	const telemetry = useContext(TelemetryContext);
	return (path: string) => ({
		href: path,
		onPress: () => {
			try {
				telemetry.sendEvent(TelemetryEvent.NavigationEvent, {
					path,
					component,
				});
			} catch (err) {
				console.warn('telemetry failure', err);
			}
		},
	});
};

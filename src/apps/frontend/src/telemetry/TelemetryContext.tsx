import type { AppConfig } from 'models';
import type { ReactNode} from 'react';
import { createContext, useContext, useState } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { TelemetryService } from './telemetryService';

function getUserTelemetryClientUrl(stage: AppConfig['stage']): string {
	switch (stage) {
		case 'PROD':
			return 'https://user-telemetry.gutools.co.uk';
		case 'CODE':
			return 'https://user-telemetry.code.dev-gutools.co.uk';
		case 'DEV':
		default:
			return 'https://user-telemetry.local.dev-gutools.co.uk';
	}
}

export const TelemetryContext = createContext<TelemetryService>(
	new TelemetryService(
		getUserTelemetryClientUrl(undefined),
		'unconfigured',
		'LOCAL',
	),
);

export const TelemetryServiceProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const appConfig = useContext(ConfigContext);

	const [telemetryService] = useState(
		new TelemetryService(
			getUserTelemetryClientUrl(appConfig?.stage),
			'dispatch',
			appConfig?.stage ?? 'LOCAL',
		),
	);

	return (
		<TelemetryContext.Provider value={telemetryService}>
			{children}
		</TelemetryContext.Provider>
	);
};

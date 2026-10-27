import type { IUserTelemetryEvent } from '@guardian/user-telemetry-client';
import { UserTelemetryEventSender } from '@guardian/user-telemetry-client';
import type { Stage } from 'models';

export enum TelemetryEvent {
	ButtonClick = 'BUTTON_CLICK',
	ShortcutEvent = 'SHORTCUT_EVENT',
	NavigationEvent = 'NAVIGATION_EVENT',
}

export type SendTelemetryEvent = {
	(
		type: TelemetryEvent,
		tags?: IUserTelemetryEvent['tags'],
		value?: boolean | number,
	): void;
};

function getUserTelemetryClientUrl(stage: Stage): string {
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

export class TelemetryService {
	private userTelemetryEventSender: UserTelemetryEventSender;

	public constructor(
		private readonly app: string,
		private readonly stage: Stage,
		private throttleDelay: number = 10000,
	) {
		this.userTelemetryEventSender = new UserTelemetryEventSender(
			getUserTelemetryClientUrl(stage),
			this.throttleDelay,
		);
	}

	public sendEvent: SendTelemetryEvent = (
		type: TelemetryEvent,
		tags?: IUserTelemetryEvent['tags'],
		value: boolean | number = true,
	) => {
		if (this.stage === 'DEV') {
			console.log(type, tags, value);
		}
		this.userTelemetryEventSender.addEvent({
			app: this.app,
			stage: this.stage,
			eventTime: new Date().toISOString(),
			type,
			value,
			tags,
		});
	};
}

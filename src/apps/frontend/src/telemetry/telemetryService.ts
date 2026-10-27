import type { IUserTelemetryEvent } from '@guardian/user-telemetry-client';
import { UserTelemetryEventSender } from '@guardian/user-telemetry-client';

export enum TelemetryEvent {
	ButtonClick = 'BUTTON_CLICK',
	ShortcutEvent = 'SHORTCUT_EVENT',
	NavigationEvent = 'NAVIGATION_EVENT'
}

export type SendTelemetryEvent = {
	(
		type: TelemetryEvent,
		tags?: IUserTelemetryEvent['tags'],
		value?: boolean | number,
	): void;
};

export class TelemetryService {
	private userTelemetryEventSender: UserTelemetryEventSender;

	public constructor(
		private telemetryUrl: string,
		private readonly app: string,
		private readonly stage: string,
		private throttleDelay: number = 10000,
	) {
		this.userTelemetryEventSender = new UserTelemetryEventSender(
			this.telemetryUrl,
			this.throttleDelay,
		);
	}

	public sendEvent: SendTelemetryEvent = (
		type: TelemetryEvent,
		tags?: IUserTelemetryEvent['tags'],
		value: boolean | number = true,
	) => {
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


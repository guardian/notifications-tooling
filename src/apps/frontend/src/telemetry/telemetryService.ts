import type { IUserTelemetryEvent } from '@guardian/user-telemetry-client';
import { UserTelemetryEventSender } from '@guardian/user-telemetry-client';
import type { Stage } from 'models';

export enum TelemetryEvent {
	ButtonClick = 'BUTTON_CLICK',
	NavigationEvent = 'NAVIGATION_EVENT',
	FormSubmitError = 'FORM_SUBMIT_ERROR_EVENT',
	FormSubmitPrepareSend = 'FORM_SUBMIT_PREPARE_SEND_EVENT',
	SendNotificationEvent = 'SEND_NOTIFICATION_EVENT',
	FailedNotificationEvent = 'FAILED_NOTIFICATION_EVENT',
	SuccesfulNotificationEvent = 'SUCCESFUL_NOTIFICATION_EVENT',
}

export type TelemetryTags = IUserTelemetryEvent['tags'];

export type SendTelemetryEvent = {
	(type: TelemetryEvent, tags?: TelemetryTags, value?: boolean | number): void;
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

const APP_NAME = 'dispatch';

export class TelemetryService {
	private userTelemetryEventSender: UserTelemetryEventSender;

	public constructor(
		private readonly sessionId: string,
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
		tagsWithoutSessionId?: IUserTelemetryEvent['tags'],
		value: boolean | number = true,
	) => {
		const tags = { ...tagsWithoutSessionId, sessionId: this.sessionId };
		if (this.stage === 'DEV') {
			console.log(type, tags, value);
			return;
		}
		try {
			this.userTelemetryEventSender.addEvent({
				app: APP_NAME,
				stage: this.stage,
				eventTime: new Date().toISOString(),
				type,
				value,
				tags,
			});
		} catch (err) {
			console.warn('telemetry failure', err);
		}
	};
}

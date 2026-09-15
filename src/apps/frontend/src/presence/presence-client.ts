export interface PresencePerson {
	firstName: string;
	lastName: string;
	email: string;
}

export interface PresenceEntry {
	clientId: {
		connId?: string;
		person: PresencePerson;
	};
	location?: string;
	locations?: string[];
}

interface PresenceUpdate {
	subscriptionId?: string;
	currentState?: PresenceEntry[];
}

interface PresenceSubscription {
	subscriptionId: string;
	currentState: PresenceEntry[];
}

interface PresenceSubscribedMessage {
	data?: { subscribedTo?: PresenceSubscription[] };
	subscribedTo?: PresenceSubscription[];
}

type PresenceMessage = PresenceUpdate | PresenceSubscribedMessage;
type PresenceHandler = (message?: PresenceMessage) => void;

export interface PresenceClient {
	on(event: string, handler: PresenceHandler): void;
	subscribe(contentIds: string[]): Promise<unknown> | void;
	enter(contentId: string, location: string): Promise<unknown> | void;
	startConnection(): Promise<unknown> | void;
	closeConnection(): void;
}

type PresenceClientFactory = (
	endpoint: string,
	person: PresencePerson,
) => PresenceClient;

declare global {
	interface Window {
		presenceClient?: PresenceClientFactory;
	}
}

let presenceClientScriptPromise: Promise<PresenceClientFactory> | undefined;

export const loadPresenceClient = (
	clientUrl: string,
): Promise<PresenceClientFactory> => {
	if (window.presenceClient) {
		return Promise.resolve(window.presenceClient);
	}

	presenceClientScriptPromise ??= new Promise<PresenceClientFactory>(
		(resolve, reject) => {
			const script = document.createElement('script');
			script.src = clientUrl;
			script.async = true;
			script.addEventListener('load', () => {
				if (window.presenceClient) {
					resolve(window.presenceClient);
					return;
				}
				reject(new Error('Presence client did not register on window'));
			});
			script.addEventListener('error', () => {
				reject(new Error('Presence client script failed to load'));
			});
			document.head.append(script);
		},
	).catch((error: unknown) => {
		presenceClientScriptPromise = undefined;
		throw error;
	});

	return presenceClientScriptPromise;
};

export const getSubscribedPresence = (
	message: PresenceMessage | undefined,
	contentId: string,
): PresenceEntry[] | undefined => {
	const subscribedMessage = message as PresenceSubscribedMessage | undefined;
	const subscriptions =
		subscribedMessage?.data?.subscribedTo ?? subscribedMessage?.subscribedTo;
	return subscriptions?.find(
		(subscription) => subscription.subscriptionId === contentId,
	)?.currentState;
};

export const getUpdatedPresence = (
	message: PresenceMessage | undefined,
	contentId: string,
): PresenceEntry[] | undefined => {
	const update = message as PresenceUpdate | undefined;
	return update?.subscriptionId === contentId ? update.currentState : undefined;
};

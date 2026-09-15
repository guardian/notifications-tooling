import type { AppConfig } from '@models';
import { useEffect, useState } from 'react';
import {
	getSubscribedPresence,
	getUpdatedPresence,
	loadPresenceClient,
	type PresenceEntry,
} from './presence-client';

export const usePresence = (
	contentId: string | undefined,
	config: AppConfig | undefined,
): PresenceEntry[] => {
	const [presenceState, setPresenceState] = useState<{
		contentId: string;
		presences: PresenceEntry[];
	}>({ contentId: '', presences: [] });

	useEffect(() => {
		const presenceConfig = config?.presence;
		if (!presenceConfig) {
			return;
		}

		let isActive = true;
		let closeConnection: (() => void) | undefined;

		const reportPresenceError = (operation: string, error: unknown) => {
			console.error(`Presence ${operation} failed`, error);
		};

		void loadPresenceClient(presenceConfig.clientUrl)
			.then((createPresenceClient) => {
				if (!isActive) {
					return;
				}

				const client = createPresenceClient(presenceConfig.endpoint, {
					firstName: config.user.firstName,
					lastName: config.user.lastName,
					email: config.user.email,
				});
				closeConnection = () => client.closeConnection();

				if (contentId) {
					client.on('visitor-list-subscribe', (message) => {
						const subscribedPresence = getSubscribedPresence(
							message,
							contentId,
						);
						if (isActive && subscribedPresence) {
							setPresenceState({
								contentId,
								presences: subscribedPresence,
							});
						}
					});
					client.on('visitor-list-updated', (message) => {
						const updatedPresence = getUpdatedPresence(message, contentId);
						if (isActive && updatedPresence) {
							setPresenceState({ contentId, presences: updatedPresence });
						}
					});
				}
				client.on('connection.open', () => {
					if (!contentId) {
						return;
					}
					void Promise.resolve(client.subscribe([contentId])).catch((error) => {
						reportPresenceError('subscription', error);
					});
					void Promise.resolve(client.enter(contentId, 'document')).catch(
						(error) => {
							reportPresenceError('entry', error);
						},
					);
				});

				void Promise.resolve(client.startConnection()).catch((error) => {
					reportPresenceError('connection', error);
				});
			})
			.catch((error: unknown) => {
				reportPresenceError('client startup', error);
			});

		return () => {
			isActive = false;
			closeConnection?.();
		};
	}, [config, contentId]);

	return contentId && config?.presence && presenceState.contentId === contentId
		? presenceState.presences
		: [];
};

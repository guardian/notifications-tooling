import { useCallback, useState } from 'react';
import type { Kicker } from './api/schemas';

export interface NotificationDraft {
	articleUrl: string;
	kicker: Kicker;
	subject: string;
	previewText: string;
}

const INITIAL_DRAFT: NotificationDraft = {
	articleUrl: '',
	kicker: 'none',
	subject: '',
	previewText: '',
};

export interface NotificationDraftState {
	draft: NotificationDraft;
	/** Key is created once and is stable across edits */
	idempotencyKey: string;
	setArticleUrl: (value: string) => void;
	setKicker: (value: Kicker) => void;
	setSubject: (value: string) => void;
	setPreviewText: (value: string) => void;
	/** Creates a fresh idempotencyKey without changing the draft */
	rotateIdempotencyKey: () => void;
	/** Clears the draft and creates a fresh idempotencyKey */
	startNewNotification: () => void;
}

/**
 * Owns the notification draft + its idempotencyKey so `CreateNotificationForm`
 * stays a controlled, presentational component.
 */
export function useNotificationDraft(): NotificationDraftState {
	const [draft, setDraft] = useState<NotificationDraft>(INITIAL_DRAFT);
	const [idempotencyKey, setIdempotencyKey] = useState(() =>
		crypto.randomUUID(),
	);

	const setArticleUrl = useCallback(
		(value: string) => setDraft((prev) => ({ ...prev, articleUrl: value })),
		[],
	);
	const setKicker = useCallback(
		(value: Kicker) => setDraft((prev) => ({ ...prev, kicker: value })),
		[],
	);
	const setSubject = useCallback(
		(value: string) => setDraft((prev) => ({ ...prev, subject: value })),
		[],
	);
	const setPreviewText = useCallback(
		(value: string) => setDraft((prev) => ({ ...prev, previewText: value })),
		[],
	);
	const rotateIdempotencyKey = useCallback(() => {
		setIdempotencyKey(crypto.randomUUID());
	}, []);

	const startNewNotification = useCallback(() => {
		setDraft(INITIAL_DRAFT);
		setIdempotencyKey(crypto.randomUUID());
	}, []);

	return {
		draft,
		idempotencyKey,
		setArticleUrl,
		setKicker,
		setSubject,
		setPreviewText,
		rotateIdempotencyKey,
		startNewNotification,
	};
}

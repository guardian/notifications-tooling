import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import { useNotificationDraft } from './useNotificationDraft';

describe('useNotificationDraft', () => {
	it('keeps the idempotencyKey stable across edits of the same draft', () => {
		const { result } = renderHook(() => useNotificationDraft());
		const initialKey = result.current.idempotencyKey;

		act(() => {
			result.current.setSubject('Breaking news');
		});

		expect(result.current.idempotencyKey).toBe(initialKey);
		expect(result.current.draft.subject).toBe('Breaking news');
	});

	it('creates a new idempotencyKey and clears the draft when starting a new notification', () => {
		const { result } = renderHook(() => useNotificationDraft());
		const initialKey = result.current.idempotencyKey;

		act(() => {
			result.current.setSubject('Breaking news');
		});
		act(() => {
			result.current.startNewNotification();
		});

		expect(result.current.idempotencyKey).not.toBe(initialKey);
		expect(result.current.draft.subject).toBe('');
	});

	it('creates a new idempotencyKey without clearing the validated draft', () => {
		const { result } = renderHook(() => useNotificationDraft());
		const initialKey = result.current.idempotencyKey;

		act(() => {
			result.current.setArticleUrl(
				'https://www.theguardian.com/world/2026/jul/22/example',
			);
			result.current.setKicker('breaking-news');
			result.current.setSubject('Breaking news');
			result.current.setPreviewText('Preview text');
		});
		const validatedDraft = result.current.draft;

		act(() => {
			result.current.rotateIdempotencyKey();
		});

		expect(result.current.idempotencyKey).not.toBe(initialKey);
		expect(result.current.draft).toEqual(validatedDraft);
	});
});

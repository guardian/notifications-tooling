import { useCallback, useMemo, useState } from "react";
import type { DeliveryMode, DispatchDraft, SegmentId } from "./types";

const INITIAL_DRAFT: DispatchDraft = {
  articleUrl: "",
  subject: "",
  previewText: "",
  segments: [],
  deliveryMode: "immediate",
  scheduledFor: null,
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

export interface DispatchState {
  draft: DispatchDraft;
  /** Whether the draft has the minimum content required to be sent. */
  isReady: boolean;
  /** Formatted time of the last edit, used to show an auto-save indicator. */
  savedAt: string;
  /** Monotonic counter that increments on every edit. */
  revision: number;
  setArticleUrl: (value: string) => void;
  setSubject: (value: string) => void;
  setPreviewText: (value: string) => void;
  copySubjectToPreview: () => void;
  toggleSegment: (id: SegmentId) => void;
  setDeliveryMode: (mode: DeliveryMode) => void;
  setScheduledFor: (value: string | null) => void;
}

/**
 * Owns the dispatch draft state and exposes intent-based updaters so the
 * presentational components stay free of state-management logic.
 */
export function useDispatchState(): DispatchState {
  const [draft, setDraft] = useState<DispatchDraft>(INITIAL_DRAFT);
  const [savedAt, setSavedAt] = useState(() => formatTime(new Date()));
  const [revision, setRevision] = useState(0);

  // Applies a draft update and stamps the auto-save indicator.
  const update = useCallback(
    (updater: (prev: DispatchDraft) => DispatchDraft) => {
      setDraft(updater);
      setSavedAt(formatTime(new Date()));
      setRevision((value) => value + 1);
    },
    [],
  );

  const setArticleUrl = useCallback(
    (value: string) => update((prev) => ({ ...prev, articleUrl: value })),
    [update],
  );

  const setSubject = useCallback(
    (value: string) => update((prev) => ({ ...prev, subject: value })),
    [update],
  );

  const setPreviewText = useCallback(
    (value: string) => update((prev) => ({ ...prev, previewText: value })),
    [update],
  );

  const copySubjectToPreview = useCallback(
    () => update((prev) => ({ ...prev, previewText: prev.subject })),
    [update],
  );

  const toggleSegment = useCallback(
    (id: SegmentId) =>
      update((prev) => ({
        ...prev,
        segments: prev.segments.includes(id)
          ? prev.segments.filter((segment) => segment !== id)
          : [...prev.segments, id],
      })),
    [update],
  );

  const setDeliveryMode = useCallback(
    (mode: DeliveryMode) =>
      update((prev) => ({
        ...prev,
        deliveryMode: mode,
        // Clear any schedule when moving away from the scheduled mode.
        scheduledFor: mode === "scheduled" ? prev.scheduledFor : null,
      })),
    [update],
  );

  const setScheduledFor = useCallback(
    (value: string | null) =>
      update((prev) => ({ ...prev, scheduledFor: value })),
    [update],
  );

  const isReady = useMemo(() => {
    const hasSubject = draft.subject.trim().length > 0;
    const hasSchedule =
      draft.deliveryMode !== "scheduled" || draft.scheduledFor !== null;
    return hasSubject && hasSchedule;
  }, [draft.subject, draft.deliveryMode, draft.scheduledFor]);

  return {
    draft,
    isReady,
    savedAt,
    revision,
    setArticleUrl,
    setSubject,
    setPreviewText,
    copySubjectToPreview,
    toggleSegment,
    setDeliveryMode,
    setScheduledFor,
  };
}

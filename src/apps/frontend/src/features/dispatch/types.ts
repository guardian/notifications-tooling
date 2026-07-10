/** The audience segments a dispatch can be targeted at. */
export type SegmentId = "UK" | "US" | "AU" | "EU" | "ALL";

/** The delivery/timing strategy for a dispatch. */
export type DeliveryMode = "immediate" | "scheduled" | "intelligent";

/** The tabs of the composer form. */
export type ComposerTab = "content" | "audience" | "delivery";

/** The full editable state of a dispatch draft. */
export interface DispatchDraft {
  articleUrl: string;
  subject: string;
  previewText: string;
  segments: SegmentId[];
  deliveryMode: DeliveryMode;
  /** ISO string from a `datetime-local` input, or `null` when not scheduled. */
  scheduledFor: string | null;
}

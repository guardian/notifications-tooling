/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { InlineMessage } from "@guardian/stand/InlineMessage";
import { semanticColors } from "@guardian/stand";
import type { DispatchState } from "../useDispatchState";
import { Field } from "./Field";
import { SegmentSelector } from "./SegmentSelector";

const styles = {
  labelRow: css({
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }),
  badge: css({
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "0.6875rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: semanticColors.text.warning,
    backgroundColor: semanticColors.fill.warningWeak,
  }),
  message: css({
    marginTop: "16px",
  }),
};

interface AudiencePanelProps {
  state: DispatchState;
}

/** The "Audience" tab: segment targeting (not yet wired to delivery). */
export function AudiencePanel({ state }: AudiencePanelProps) {
  return (
    <Field
      label={
        <span css={styles.labelRow}>
          Audience segments
          <span css={styles.badge}>Not in production</span>
        </span>
      }
    >
      <SegmentSelector
        selected={state.draft.segments}
        onToggle={state.toggleSegment}
      />
      <div css={styles.message}>
        <InlineMessage level="information">
          <strong>Targeting not yet active.</strong> Segment selection is
          captured but not wired to delivery — every dispatch goes to the same
          Braze campaign regardless of which segments are chosen.
        </InlineMessage>
      </div>
    </Field>
  );
}

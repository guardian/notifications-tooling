/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";
import { Button } from "@guardian/stand/Button";
import { InlineMessage } from "@guardian/stand/InlineMessage";
import { DELIVERY_SUMMARY, SEGMENT_OPTIONS } from "../constants";
import type { DispatchState } from "../useDispatchState";
import { EmailPreview } from "./EmailPreview";

const styles = {
  panel: css({
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  }),
  sectionLabel: css({
    margin: 0,
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: semanticColors.text.weak,
  }),
  routingCard: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "16px",
    borderRadius: "8px",
    border: `1px solid ${semanticColors.border.weak}`,
    backgroundColor: semanticColors.bg.base,
  }),
  routingTitle: css({
    fontWeight: 700,
    color: semanticColors.text.strong,
  }),
  routingSub: css({
    fontSize: "0.875rem",
    color: semanticColors.text.weak,
  }),
  badge: css({
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.8125rem",
    fontWeight: 700,
    color: semanticColors.text.blue,
    backgroundColor: semanticColors.fill.blueWeak,
  }),
  chips: css({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  }),
  chip: css({
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "0.8125rem",
    fontWeight: 700,
    color: semanticColors.text.strong,
    backgroundColor: semanticColors.bg.raisedLevel2,
  }),
  empty: css({
    margin: 0,
    fontSize: "0.9375rem",
    fontStyle: "italic",
    color: semanticColors.text.weak,
  }),
  helper: css({
    margin: 0,
    textAlign: "center",
    fontSize: "0.875rem",
    color: semanticColors.text.weak,
  }),
  section: css({
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }),
};

interface PreviewPanelProps {
  state: DispatchState;
  onSend: () => void;
  sent: boolean;
}

/** Right-hand column: live email preview, routing summary and send action. */
export function PreviewPanel({ state, onSend, sent }: PreviewPanelProps) {
  const { draft, isReady } = state;
  const selectedSegments = SEGMENT_OPTIONS.filter((segment) =>
    draft.segments.includes(segment.id),
  );

  return (
    <div css={styles.panel}>
      <div css={styles.section}>
        <p css={styles.sectionLabel}>Email preview</p>
        <EmailPreview subject={draft.subject} previewText={draft.previewText} />
      </div>

      <div css={styles.section}>
        <p css={styles.sectionLabel}>Routing</p>
        <div css={styles.routingCard}>
          <div>
            <div css={styles.routingTitle}>Newsletter · Email</div>
            <div css={styles.routingSub}>
              {DELIVERY_SUMMARY[draft.deliveryMode]}
            </div>
          </div>
          <span css={styles.badge}>Braze</span>
        </div>
      </div>

      <div css={styles.section}>
        <p css={styles.sectionLabel}>Sending to</p>
        {selectedSegments.length === 0 ? (
          <p css={styles.empty}>No segments selected</p>
        ) : (
          <div css={styles.chips}>
            {selectedSegments.map((segment) => (
              <span key={segment.id} css={styles.chip}>
                {segment.code}
              </span>
            ))}
          </div>
        )}
      </div>

      {sent ? (
        <InlineMessage level="success">
          Dispatch queued. Braze will deliver this newsletter.
        </InlineMessage>
      ) : (
        <>
          <Button
            variant="primary"
            onPress={onSend}
            isDisabled={!isReady}
            css={css({ width: "100%" })}
          >
            Send dispatch
          </Button>
          {!isReady && (
            <p css={styles.helper}>
              {draft.subject.trim().length === 0
                ? "Add a subject line to continue"
                : "Pick a send time to continue"}
            </p>
          )}
        </>
      )}
    </div>
  );
}

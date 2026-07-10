/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";

const styles = {
  card: css({
    border: `1px solid ${semanticColors.border.weak}`,
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: semanticColors.bg.base,
  }),
  viewInBrowser: css({
    padding: "8px 16px",
    textAlign: "right",
    fontSize: "0.75rem",
    color: semanticColors.text.weak,
  }),
  masthead: css({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px",
    background: "linear-gradient(90deg, #7d0000 0%, #b51800 60%, #d9402a 100%)",
    color: "#ffffff",
  }),
  dot: css({
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#ffe500",
    flexShrink: 0,
  }),
  mastheadTitle: css({
    fontSize: "1.5rem",
    fontWeight: 700,
    fontFamily: "'Georgia', 'Times New Roman', serif",
  }),
  body: css({
    padding: "16px",
  }),
  date: css({
    paddingBottom: "12px",
    marginBottom: "12px",
    borderBottom: `1px solid ${semanticColors.border.weak}`,
    fontSize: "0.875rem",
    color: semanticColors.text.weak,
  }),
  subject: css({
    margin: "0 0 8px",
    fontSize: "1.5rem",
    lineHeight: 1.2,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: semanticColors.text.strong,
  }),
  placeholder: css({
    color: semanticColors.text.disabled,
  }),
  standfirst: css({
    margin: 0,
    fontSize: "0.9375rem",
    color: semanticColors.text.weak,
  }),
  imagePlaceholder: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "120px",
    marginTop: "16px",
    borderRadius: "4px",
    backgroundColor: semanticColors.bg.raisedLevel2,
    color: semanticColors.text.disabled,
    fontSize: "0.875rem",
  }),
};

const PREVIEW_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

interface EmailPreviewProps {
  subject: string;
  previewText: string;
}

/** A live-updating mock of the "Breaking News" newsletter email. */
export function EmailPreview({ subject, previewText }: EmailPreviewProps) {
  return (
    <div css={styles.card}>
      <div css={styles.viewInBrowser}>View in browser</div>
      <div css={styles.masthead}>
        <span css={styles.dot} aria-hidden="true" />
        <span css={styles.mastheadTitle}>Breaking News</span>
      </div>
      <div css={styles.body}>
        <div css={styles.date}>{PREVIEW_DATE}</div>
        <h2 css={styles.subject}>
          {subject.trim() || (
            <span css={styles.placeholder}>
              Your subject line will appear here
            </span>
          )}
        </h2>
        <p css={styles.standfirst}>
          {previewText.trim() || (
            <span css={styles.placeholder}>
              Your preview text appears here as the email standfirst.
            </span>
          )}
        </p>
        <div css={styles.imagePlaceholder}>Article image</div>
      </div>
    </div>
  );
}

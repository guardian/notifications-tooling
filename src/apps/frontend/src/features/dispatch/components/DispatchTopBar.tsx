/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Avatar } from "@guardian/stand/Avatar";
import { Favicon } from "@guardian/stand/Favicon";
import { Icon } from "@guardian/stand/Icon";
import { semanticColors } from "@guardian/stand";

const styles = {
  bar: css({
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "10px 20px",
    borderBottom: `1px solid ${semanticColors.border.weak}`,
    backgroundColor: semanticColors.bg.base,
  }),
  brand: css({
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),
  status: css({
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "0.8125rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  }),
  statusReady: css({
    color: semanticColors.text.success,
    backgroundColor: semanticColors.fill.successWeak,
  }),
  statusNotReady: css({
    color: semanticColors.text.error,
    backgroundColor: semanticColors.fill.errorWeak,
  }),
  saved: css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.875rem",
    color: semanticColors.text.success,
  }),
  savedLabel: css({
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  }),
  savedTime: css({
    color: semanticColors.text.weak,
  }),
  spacer: css({
    flex: 1,
  }),
  desk: css({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
    color: semanticColors.text.strong,
  }),
  deskDot: css({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: semanticColors.fill.errorStrong,
  }),
};

interface DispatchTopBarProps {
  isReady: boolean;
  savedAt: string;
}

/** Application top bar with draft status, save state, desk and user. */
export function DispatchTopBar({ isReady, savedAt }: DispatchTopBarProps) {
  return (
    <header css={styles.bar}>
      <div css={styles.brand}>
        <Favicon letter="D" />
        <Icon symbol="article" size="md" />
      </div>

      <span
        css={[
          styles.status,
          isReady ? styles.statusReady : styles.statusNotReady,
        ]}
      >
        {isReady ? "Ready" : "Not ready"}
      </span>

      <span css={styles.saved}>
        <Icon symbol="check_circle" size="sm" />
        <span css={styles.savedLabel}>Saved</span>
        <span css={styles.savedTime}>{savedAt}</span>
      </span>

      <span css={styles.spacer} />

      <span css={styles.desk}>
        <span css={styles.deskDot} aria-hidden="true" />
        Breaking desk
      </span>
      <Avatar initials="MW" alt="Morgan Wells" />
    </header>
  );
}

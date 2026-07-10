/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";

const styles = {
  count: css({
    display: "block",
    textAlign: "right",
    fontSize: "0.8125rem",
    color: semanticColors.text.weak,
  }),
  overLimit: css({
    color: semanticColors.text.error,
    fontWeight: 700,
  }),
};

interface CharacterCountProps {
  value: number;
  max: number;
}

/** Shows a `current / max` counter, highlighting when the limit is exceeded. */
export function CharacterCount({ value, max }: CharacterCountProps) {
  const isOverLimit = value > max;
  return (
    <span
      css={[styles.count, isOverLimit && styles.overLimit]}
      aria-live="polite"
    >
      {value} / {max}
    </span>
  );
}

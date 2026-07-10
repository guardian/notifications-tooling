/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";
import { SEGMENT_OPTIONS } from "../constants";
import type { SegmentId } from "../types";

const styles = {
  group: css({
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    margin: 0,
    padding: 0,
    border: "none",
  }),
  legend: css({
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  }),
  pill: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: "120px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: `1px solid ${semanticColors.border.weak}`,
    backgroundColor: semanticColors.bg.base,
    cursor: "pointer",
    transition: "border-color 0.15s, background-color 0.15s",
    "&:hover": {
      borderColor: semanticColors.border.strong,
    },
    "&:has(input:focus-visible)": {
      outline: `2px solid ${semanticColors.border.focused}`,
      outlineOffset: "2px",
    },
    "&:has(input:checked)": {
      borderColor: semanticColors.border.selected,
      backgroundColor: semanticColors.fill.selectedWeak,
    },
  }),
  input: css({
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  }),
  code: css({
    fontSize: "1rem",
    fontWeight: 700,
    color: semanticColors.text.strong,
  }),
  label: css({
    fontSize: "0.8125rem",
    color: semanticColors.text.weak,
  }),
};

interface SegmentSelectorProps {
  selected: SegmentId[];
  onToggle: (id: SegmentId) => void;
}

/** Multi-select toggle pills (native checkboxes) for audience segments. */
export function SegmentSelector({ selected, onToggle }: SegmentSelectorProps) {
  return (
    <fieldset css={styles.group}>
      <legend css={styles.legend}>Audience segments</legend>
      {SEGMENT_OPTIONS.map((segment) => (
        <label key={segment.id} css={styles.pill}>
          <input
            css={styles.input}
            type="checkbox"
            name="segments"
            value={segment.id}
            checked={selected.includes(segment.id)}
            onChange={() => onToggle(segment.id)}
          />
          <span css={styles.code}>{segment.code}</span>
          <span css={styles.label}>{segment.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

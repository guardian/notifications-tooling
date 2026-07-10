/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";
import type { DispatchState } from "../useDispatchState";
import { DeliveryOptions } from "./DeliveryOptions";
import { Field } from "./Field";

const styles = {
  schedule: css({
    marginTop: "16px",
  }),
  scheduleLabel: css({
    display: "block",
    marginBottom: "8px",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: semanticColors.text.strong,
  }),
  input: css({
    padding: "10px 12px",
    borderRadius: "6px",
    border: `1px solid ${semanticColors.border.strong}`,
    fontSize: "1rem",
    fontFamily: "inherit",
    color: semanticColors.text.strong,
    backgroundColor: semanticColors.bg.base,
    "&:focus-visible": {
      outline: `2px solid ${semanticColors.border.focused}`,
      outlineOffset: "1px",
    },
  }),
};

interface DeliveryPanelProps {
  state: DispatchState;
}

/** The "Delivery" tab: choose the timing strategy and optional schedule. */
export function DeliveryPanel({ state }: DeliveryPanelProps) {
  const { draft } = state;

  return (
    <Field label="Delivery & timing">
      <DeliveryOptions
        selected={draft.deliveryMode}
        onSelect={state.setDeliveryMode}
      />
      {draft.deliveryMode === "scheduled" && (
        <div css={styles.schedule}>
          <label css={styles.scheduleLabel} htmlFor="scheduled-for">
            Send at
          </label>
          <input
            id="scheduled-for"
            type="datetime-local"
            css={styles.input}
            value={draft.scheduledFor ?? ""}
            onChange={(event) =>
              state.setScheduledFor(event.target.value || null)
            }
          />
        </div>
      )}
    </Field>
  );
}

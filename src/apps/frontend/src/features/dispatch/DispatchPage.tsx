/** @jsxImportSource @emotion/react */
import { useState } from "react";
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";
import { ComposerTabs } from "./components/ComposerTabs";
import { DispatchTopBar } from "./components/DispatchTopBar";
import { PreviewPanel } from "./components/PreviewPanel";
import { useDispatchState } from "./useDispatchState";

const styles = {
  page: css({
    minHeight: "100vh",
    backgroundColor: semanticColors.bg.raisedLevel1,
    color: semanticColors.text.strong,
  }),
  layout: css({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)",
    alignItems: "start",
    gap: "24px",
    padding: "24px",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  }),
  composer: css({
    borderRadius: "8px",
    border: `1px solid ${semanticColors.border.weak}`,
    backgroundColor: semanticColors.bg.base,
    overflow: "hidden",
  }),
  aside: css({
    position: "sticky",
    top: "24px",
    padding: "20px",
    borderRadius: "8px",
    border: `1px solid ${semanticColors.border.weak}`,
    backgroundColor: semanticColors.bg.base,
    "@media (max-width: 900px)": {
      position: "static",
    },
  }),
};

/** Top-level "Dispatch" composer page. */
export function DispatchPage() {
  const state = useDispatchState();
  // The dispatch counts as "sent" only until the next edit changes the draft.
  const [sentRevision, setSentRevision] = useState<number | null>(null);
  const sent = sentRevision === state.revision;

  const handleClose = () => {
    if (window.confirm("Close this dispatch? Unsaved changes may be lost.")) {
      window.location.reload();
    }
  };

  return (
    <div css={styles.page}>
      <DispatchTopBar isReady={state.isReady} savedAt={state.savedAt} />
      <div css={styles.layout}>
        <main css={styles.composer}>
          <ComposerTabs state={state} onClose={handleClose} />
        </main>
        <aside css={styles.aside} aria-label="Dispatch summary">
          <PreviewPanel
            state={state}
            onSend={() => setSentRevision(state.revision)}
            sent={sent}
          />
        </aside>
      </div>
    </div>
  );
}

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { semanticColors } from "@guardian/stand";
import { Button } from "@guardian/stand/Button";
import { Icon } from "@guardian/stand/Icon";
import { TextArea } from "@guardian/stand/TextArea";
import { TextInput } from "@guardian/stand/TextInput";
import { PREVIEW_MAX_LENGTH, SUBJECT_MAX_LENGTH } from "../constants";
import type { DispatchState } from "../useDispatchState";
import { CharacterCount } from "./CharacterCount";
import { Field } from "./Field";

const styles = {
  importBar: css({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "12px",
    padding: "12px 16px",
    borderRadius: "6px",
    backgroundColor: semanticColors.bg.raisedLevel2,
    color: semanticColors.text.weak,
    fontSize: "0.875rem",
  }),
  importLabel: css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
    color: semanticColors.text.strong,
  }),
  importHint: css({
    flex: 1,
  }),
  previewLabelRow: css({
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }),
};

interface ContentPanelProps {
  state: DispatchState;
}

/** The "Content" tab: article import, subject line and preview text. */
export function ContentPanel({ state }: ContentPanelProps) {
  const { draft } = state;

  const handleFetch = () => {
    const trimmed = draft.articleUrl.trim();
    if (trimmed.length === 0) {
      return;
    }
    // The prototype's importer is not wired to a backend, so we derive a
    // readable headline from the URL slug to demonstrate the flow.
    const slug = trimmed.split("/").filter(Boolean).at(-1) ?? "";
    const headline = slug
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .slice(0, SUBJECT_MAX_LENGTH);
    if (headline) {
      state.setSubject(headline);
    }
  };

  return (
    <>
      <Field label="Article source" htmlFor="article-source">
        <TextInput
          id="article-source"
          aria-label="Article source"
          fluid
          placeholder="https://www.theguardian.com/…"
          value={draft.articleUrl}
          onChange={state.setArticleUrl}
          type="url"
          inputMode="url"
        />
        <div css={styles.importBar}>
          <span css={styles.importLabel}>
            <Icon symbol="autorenew" size="sm" />
            Article import
          </span>
          <span css={styles.importHint}>Paste a Guardian URL, then fetch</span>
          <Button
            variant="primary"
            icon="arrow_forward"
            onPress={handleFetch}
            isDisabled={draft.articleUrl.trim().length === 0}
          >
            Fetch
          </Button>
        </div>
      </Field>

      <Field label="Subject line" htmlFor="subject-line">
        <TextInput
          id="subject-line"
          aria-label="Subject line"
          fluid
          placeholder="Enter the breaking-news subject line…"
          value={draft.subject}
          onChange={state.setSubject}
          maxLength={SUBJECT_MAX_LENGTH}
        />
        <CharacterCount value={draft.subject.length} max={SUBJECT_MAX_LENGTH} />
      </Field>

      <Field
        label={
          <span css={styles.previewLabelRow}>
            Preview text
            <Button
              variant="secondary"
              size="sm"
              onPress={state.copySubjectToPreview}
              isDisabled={draft.subject.trim().length === 0}
            >
              Copy from subject
            </Button>
          </span>
        }
        htmlFor="preview-text"
      >
        <TextArea
          id="preview-text"
          aria-label="Preview text"
          fluid
          placeholder="Appears as the email preview text and opening body copy…"
          value={draft.previewText}
          onChange={state.setPreviewText}
          maxLength={PREVIEW_MAX_LENGTH}
        />
        <CharacterCount
          value={draft.previewText.length}
          max={PREVIEW_MAX_LENGTH}
        />
      </Field>
    </>
  );
}

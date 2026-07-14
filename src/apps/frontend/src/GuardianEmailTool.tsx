import {
  DEFAULT_BREAKING_NEWS_IMAGE,
  renderBreakingNewsTemplate,
  withBrazeUtm,
} from "@breaking-news-template";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

type DraftEmail = {
  body: string;
  brazeEmail: string;
  headline: string;
  imageUrl: string;
  subject: string;
  url: string;
};

type StatusState = {
  kind: "error" | "idle" | "info" | "success";
  message: string;
};

const bunEnvironment = (
  globalThis as { Bun?: { env?: Record<string, string | undefined> } }
).Bun?.env;
const API_BASE_URL =
  bunEnvironment?.BUN_PUBLIC_API_BASE_URL || "http://localhost:3000";
const DEFAULT_BRAZE_RECIPIENT_EMAIL = "marcin.gosz@guardian.co.uk";

const FALLBACK_PREVIEW_HTML =
  "<html><body><p>Populate a Guardian article to load the exact breaking news template preview.</p></body></html>";

const createEmptyDraft = (): DraftEmail => ({
  body: "",
  brazeEmail: DEFAULT_BRAZE_RECIPIENT_EMAIL,
  headline: "",
  imageUrl: "",
  subject: "",
  url: "",
});

const normaliseError = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
};

const applyPreviewDocumentUpdates = (document: Document, draft: DraftEmail) => {
  const articleUrlWithBraze = withBrazeUtm(draft.url);
  const title = document.querySelector("title");
  const headline = document.querySelector('[data-preview="headline"]');
  const body = document.querySelector('[data-preview="body"]');
  const image = document.querySelector('[data-preview="image"]');
  const headlineLink = document.querySelector('[data-preview="headline-link"]');
  const imageLink = document.querySelector('[data-preview="image-link"]');

  if (title) {
    title.textContent = draft.subject || "Breaking News US | The Guardian";
  }

  if (headline) {
    headline.textContent = draft.headline;
  }

  if (body) {
    body.textContent = draft.body;
  }

  if (headlineLink) {
    headlineLink.setAttribute("href", articleUrlWithBraze);
  }

  if (image) {
    image.setAttribute("src", draft.imageUrl || DEFAULT_BREAKING_NEWS_IMAGE);
    image.setAttribute("alt", draft.headline);
  }

  if (imageLink) {
    imageLink.setAttribute("href", articleUrlWithBraze);
  }
};

const createPreviewHtml = (draft: DraftEmail) => {
  if (!draft.url) {
    return FALLBACK_PREVIEW_HTML;
  }

  return renderBreakingNewsTemplate(draft, { includePreviewMarkers: true });
};

const syncPreviewFrame = (
  frame: HTMLIFrameElement | null,
  draft: DraftEmail,
) => {
  const document = frame?.contentDocument;

  if (!document || !draft.url) {
    return;
  }

  applyPreviewDocumentUpdates(document, draft);
};

export function GuardianEmailTool() {
  const [draft, setDraft] = useState<DraftEmail>(createEmptyDraft);
  const [previewBaseHtml, setPreviewBaseHtml] = useState(FALLBACK_PREVIEW_HTML);
  const [articleUrl, setArticleUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const [fetchStatus, setFetchStatus] = useState<StatusState>({
    kind: "info",
    message: "Paste a Guardian article URL to populate the draft.",
  });
  const [sendStatus, setSendStatus] = useState<StatusState>({
    kind: "idle",
    message: "",
  });

  const canPopulate = articleUrl.trim().length > 0 && !fetching;
  const canSend =
    !sending &&
    draft.brazeEmail.trim().length > 0 &&
    draft.url.trim().length > 0 &&
    draft.subject.trim().length > 0 &&
    draft.headline.trim().length > 0 &&
    draft.body.trim().length > 0;

  useEffect(() => {
    syncPreviewFrame(previewFrameRef.current, draft);
  }, [draft.body, draft.headline, draft.imageUrl, draft.subject, draft.url]);

  const handleFieldChange =
    (field: keyof DraftEmail) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setDraft((current: DraftEmail) => ({ ...current, [field]: value }));
    };

  const populateDraft = async () => {
    setFetching(true);
    setFetchStatus({
      kind: "info",
      message: "Fetching article data from Guardian CAPI...",
    });
    setSendStatus({ kind: "idle", message: "" });

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/notifications/guardian-article`,
        {
          body: JSON.stringify({ url: articleUrl.trim() }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(await normaliseError(response));
      }

      const data = (await response.json()) as DraftEmail;
      const nextDraft: DraftEmail = {
        ...data,
        brazeEmail:
          data.brazeEmail || draft.brazeEmail || DEFAULT_BRAZE_RECIPIENT_EMAIL,
      };
      setDraft(nextDraft);
      setPreviewBaseHtml(createPreviewHtml(nextDraft));
      setArticleUrl(data.url);
      setFetchStatus({
        kind: "success",
        message:
          "Draft populated. You can edit the subject, headline or summary before sending.",
      });
    } catch (error) {
      setFetchStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not fetch article metadata.",
      });
    } finally {
      setFetching(false);
    }
  };

  const sendEmail = async () => {
    setSending(true);
    setSendStatus({ kind: "info", message: "Triggering Braze email send..." });

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/notifications/braze-email`,
        {
          body: JSON.stringify(draft),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(await normaliseError(response));
      }

      setSendStatus({
        kind: "success",
        message:
          "Braze accepted the email trigger for the configured campaign.",
      });
    } catch (error) {
      setSendStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Braze send failed.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="workspace-grid">
        <div className="editor-panel">
          <div className="panel-card">
            <label className="field-label" htmlFor="article-url">
              Guardian article URL
            </label>
            <div className="url-row">
              <input
                id="article-url"
                className="text-input"
                type="url"
                value={articleUrl}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setArticleUrl(event.target.value)
                }
                placeholder="https://www.theguardian.com/..."
              />
              <button
                className="primary-button"
                type="button"
                disabled={!canPopulate}
                onClick={populateDraft}
              >
                {fetching ? "Fetching..." : "Populate draft"}
              </button>
            </div>
            <p className={`status-line ${fetchStatus.kind}`}>
              {fetchStatus.message}
            </p>
          </div>

          <div className="panel-card form-stack">
            <label className="field-label" htmlFor="email-subject">
              Subject line
            </label>
            <input
              id="email-subject"
              className="text-input"
              type="text"
              value={draft.subject}
              onChange={handleFieldChange("subject")}
              placeholder="Breaking news: ..."
            />

            <label className="field-label" htmlFor="email-headline">
              Email headline
            </label>
            <input
              id="email-headline"
              className="text-input"
              type="text"
              value={draft.headline}
              onChange={handleFieldChange("headline")}
              placeholder="Guardian article headline"
            />

            <label className="field-label" htmlFor="email-body">
              Summary / standfirst
            </label>
            <textarea
              id="email-body"
              className="text-area"
              value={draft.body}
              onChange={handleFieldChange("body")}
              placeholder="Article summary"
              rows={6}
            />

            <label className="field-label" htmlFor="article-link">
              Destination URL
            </label>
            <input
              id="article-link"
              className="text-input"
              type="url"
              value={draft.url}
              onChange={handleFieldChange("url")}
              placeholder="https://www.theguardian.com/..."
            />

            <label className="field-label" htmlFor="article-image">
              Image URL
            </label>
            <input
              id="article-image"
              className="text-input"
              type="url"
              value={draft.imageUrl}
              onChange={handleFieldChange("imageUrl")}
              placeholder="https://media.guim.co.uk/..."
            />
          </div>

          <div className="panel-card send-card">
            <div>
              <p className="send-title">Send action</p>
              <p className="send-copy">
                The button below triggers the Braze campaign configured by the
                backend environment variables and sends to
                marcin.gosz@guardian.co.uk. The backend sends enough recipient
                data for Braze to create or update the profile at send time when
                needed.
              </p>
            </div>
            <button
              className="send-button"
              type="button"
              disabled={!canSend}
              onClick={sendEmail}
            >
              {sending ? "Sending..." : "Send via Braze"}
            </button>
            {sendStatus.message ? (
              <p className={`status-line ${sendStatus.kind}`}>
                {sendStatus.message}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="preview-panel">
          <div className="preview-header">
            <p className="preview-label">Live email preview</p>
            <p className="preview-subject">
              {draft.subject || "Breaking News US | The Guardian"}
            </p>
          </div>
          <iframe
            ref={previewFrameRef}
            className="email-preview-frame"
            srcDoc={previewBaseHtml}
            onLoad={() => syncPreviewFrame(previewFrameRef.current, draft)}
            title="Guardian breaking news email preview"
          />
        </aside>
      </section>
    </main>
  );
}

import {
  type BreakingNewsTemplateArticle,
  renderBreakingNewsTemplate,
} from "@breaking-news-template";
import { getConfigValue } from "@config";
import { type Request, type Response, Router } from "express";

const router = Router();

const GUARDIAN_HOST = "www.theguardian.com";
const DEFAULT_CAPI_ENDPOINT = "https://content.guardianapis.com";
const DEFAULT_BRAZE_ENDPOINT = "https://rest.fra-01.braze.eu";
const DEFAULT_BRAZE_RECIPIENT_EMAIL = "marcin.gosz@guardian.co.uk";

export type GuardianArticle = BreakingNewsTemplateArticle & {
  brazeEmail: string;
};

type BrazeTriggerProperties = {
  body: string;
  subject: string;
};

type BrazeRecipientAttributes = {
  email: string;
};

type BrazeRecipient = {
  email: string;
  prioritization: [
    (
      | "identified"
      | "least_recently_updated"
      | "most_recently_updated"
      | "unidentified"
    ),
    ...Array<
      | "identified"
      | "least_recently_updated"
      | "most_recently_updated"
      | "unidentified"
    >,
  ];
  attributes: BrazeRecipientAttributes;
  send_to_existing_only: false;
};

type BrazeSendPayload = {
  campaign_id: string;
  recipients: [BrazeRecipient];
  trigger_properties: BrazeTriggerProperties;
};

const TITLE_SUFFIXES = [" | The Guardian", " - The Guardian"];

type CapiContentFields = {
  headline?: string;
  standfirst?: string;
  thumbnail?: string;
  trailText?: string;
};

type CapiContent = {
  fields?: CapiContentFields;
  webTitle?: string;
  webUrl?: string;
};

type CapiItemResponse = {
  response?: {
    content?: CapiContent;
  };
};

export const sanitizeGuardianTitle = (title: string) => {
  const cleanedTitle = title.trim();

  for (const suffix of TITLE_SUFFIXES) {
    if (cleanedTitle.endsWith(suffix)) {
      return cleanedTitle.slice(0, -suffix.length).trim();
    }
  }

  return cleanedTitle;
};

export const articleIdFromGuardianUrl = (value: string) => {
  const url = parseGuardianUrl(value);
  const articleId = url.pathname.replace(/^\//, "");

  if (!articleId) {
    throw new Error("Enter a Guardian article URL with a valid article path.");
  }

  return articleId;
};

export const createBrazePayload = (
  article: GuardianArticle,
  campaignId: string,
): BrazeSendPayload => {
  const renderedHtml = renderBreakingNewsTemplate(article);

  return {
    campaign_id: campaignId,
    trigger_properties: {
      body: renderedHtml,
      subject: article.subject,
    },
    recipients: [
      {
        email: article.brazeEmail,
        prioritization: ["unidentified", "most_recently_updated"],
        attributes: {
          email: article.brazeEmail,
        },
        send_to_existing_only: false,
      },
    ],
  };
};

export const mapCapiContentToArticle = (
  content: CapiContent,
  fallbackUrl: string,
): GuardianArticle => {
  const headline = sanitizeGuardianTitle(
    content.fields?.headline || content.webTitle || "",
  );
  const body = (content.fields?.trailText || content.fields?.standfirst || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const imageUrl = content.fields?.thumbnail || "";
  const url = content.webUrl || fallbackUrl;

  return {
    body,
    brazeEmail: DEFAULT_BRAZE_RECIPIENT_EMAIL,
    headline,
    imageUrl,
    subject: headline ? `Breaking news: ${headline}` : "",
    url,
  };
};

const parseGuardianUrl = (value: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid Guardian article URL.");
  }

  if (url.protocol !== "https:" || url.hostname !== GUARDIAN_HOST) {
    throw new Error(
      "Only https://www.theguardian.com article links are supported.",
    );
  }

  return url;
};

const fetchGuardianArticle = async (value: string) => {
  const url = parseGuardianUrl(value);
  const articleId = articleIdFromGuardianUrl(url.toString());
  const capiApiKey = getConfigValue("CAPI_API_KEY", "test");
  const capiEndpoint = getConfigValue("CAPI_ENDPOINT", DEFAULT_CAPI_ENDPOINT);

  const capiUrl = new URL(`${capiEndpoint}/${articleId}`);
  capiUrl.searchParams.set("api-key", capiApiKey);
  capiUrl.searchParams.set(
    "show-fields",
    "headline,standfirst,trailText,thumbnail",
  );

  const response = await fetch(capiUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CAPI fetch failed with status ${response.status}.`);
  }

  const data = (await response.json()) as CapiItemResponse;
  const content = data.response?.content;

  if (!content) {
    throw new Error("CAPI returned no content for that article.");
  }

  const article = mapCapiContentToArticle(content, url.toString());

  if (!article.headline || !article.body) {
    throw new Error(
      "CAPI did not return enough content to populate the email draft.",
    );
  }

  return article;
};

const sendBrazeNotification = async (article: GuardianArticle) => {
  const apiKey = process.env["BRAZE_API_KEY"]?.trim() ?? "";
  const campaignId = process.env["BRAZE_CAMPAIGN_ID"]?.trim() ?? "";
  const endpoint =
    process.env["BRAZE_REST_ENDPOINT"]?.trim() || DEFAULT_BRAZE_ENDPOINT;

  if (!apiKey) {
    throw new Error("BRAZE_API_KEY is required to send an email.");
  }

  if (!campaignId) {
    throw new Error("BRAZE_CAMPAIGN_ID is required to send an email.");
  }

  const payload = createBrazePayload(article, campaignId);

  console.info("[notifications] Braze send context", {
    brazeEmail: article.brazeEmail,
    campaignId,
    endpoint: `${endpoint}/campaigns/trigger/send`,
    htmlBodyLength: payload.trigger_properties.body.length,
    subject: article.subject,
  });

  console.info("[notifications] Braze outbound payload", payload);

  const response = await fetch(`${endpoint}/campaigns/trigger/send`, {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const responseText = await response.text();

  console.info("[notifications] Braze send response", {
    body: responseText,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  });

  if (!response.ok) {
    throw new Error(
      `Braze request failed (${response.status}): ${responseText}`,
    );
  }

  return { success: true };
};

const fetchGuardianArticleHandler = async (req: Request, res: Response) => {
  const url = String(req.body?.url ?? "").trim();

  if (!url) {
    res.status(400).json({ error: "A Guardian article URL is required." });
    return;
  }

  try {
    const article = await fetchGuardianArticle(url);
    res.json(article);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch article.";
    res.status(400).json({ error: message });
  }
};

const sendNotificationHandler = async (req: Request, res: Response) => {
  const body = req.body as Partial<GuardianArticle> | undefined;
  const article: GuardianArticle = {
    body: String(body?.body ?? "").trim(),
    brazeEmail: String(
      body?.brazeEmail ?? DEFAULT_BRAZE_RECIPIENT_EMAIL,
    ).trim(),
    headline: String(body?.headline ?? "").trim(),
    imageUrl: String(body?.imageUrl ?? "").trim(),
    subject: String(body?.subject ?? "").trim(),
    url: String(body?.url ?? "").trim(),
  };

  console.info("[notifications] Received /braze-email request", {
    brazeEmail: article.brazeEmail,
    bodyLength: article.body.length,
    headline: article.headline,
    imageUrl: article.imageUrl,
    subject: article.subject,
    url: article.url,
  });

  if (
    !article.brazeEmail ||
    !article.url ||
    !article.headline ||
    !article.body ||
    !article.subject
  ) {
    res.status(400).json({
      error: "Braze email, URL, subject, headline and body are required.",
    });
    return;
  }

  try {
    parseGuardianUrl(article.url);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enter a valid Guardian article URL.";
    res.status(400).json({ error: message });
    return;
  }

  try {
    const result = await sendBrazeNotification(article);
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send Braze notification.";
    res.status(500).json({ error: message });
  }
};

router.get("/", (_req: Request, res: Response) => {
  res.json({
    channels: ["email"],
    message:
      "Use POST /guardian-article to extract Guardian metadata and POST /braze-email to trigger Braze.",
  });
});

router.post("/guardian-article", fetchGuardianArticleHandler);
router.post("/braze-email", sendNotificationHandler);

export default router;

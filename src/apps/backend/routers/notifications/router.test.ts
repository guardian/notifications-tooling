import { describe, expect, it } from "bun:test";
import { renderBreakingNewsTemplate } from "@breaking-news-template";
import {
  articleIdFromGuardianUrl,
  createBrazePayload,
  type GuardianArticle,
  mapCapiContentToArticle,
  sanitizeGuardianTitle,
} from "./index";

describe("notifications helpers", () => {
  it("strips Guardian branding from article titles", () => {
    expect(sanitizeGuardianTitle("Markets rally | The Guardian")).toBe(
      "Markets rally",
    );
    expect(sanitizeGuardianTitle("Storm warning - The Guardian")).toBe(
      "Storm warning",
    );
  });

  it("derives the article id from a Guardian URL", () => {
    expect(
      articleIdFromGuardianUrl(
        "https://www.theguardian.com/world/2026/jul/10/story",
      ),
    ).toBe("world/2026/jul/10/story");
  });

  it("maps CAPI content into the email draft fields", () => {
    expect(
      mapCapiContentToArticle(
        {
          fields: {
            headline: "Breaking update | The Guardian",
            thumbnail: "https://media.guim.co.uk/example.jpg",
            trailText: "<p>Key facts <strong>and</strong> context.</p>",
          },
          webTitle: "Fallback title | The Guardian",
          webUrl: "https://www.theguardian.com/world/2026/jul/10/story",
        },
        "https://www.theguardian.com/world/2026/jul/10/story",
      ),
    ).toEqual({
      body: "Key facts and context.",
      brazeEmail: "marcin.gosz@guardian.co.uk",
      headline: "Breaking update",
      imageUrl: "https://media.guim.co.uk/example.jpg",
      subject: "Breaking news: Breaking update",
      url: "https://www.theguardian.com/world/2026/jul/10/story",
    });
  });

  it("builds the Braze trigger payload from article content", () => {
    const article: GuardianArticle = {
      body: "Body copy",
      brazeEmail: "marcin.gosz@guardian.co.uk",
      headline: "Headline",
      imageUrl: "https://media.guim.co.uk/example.jpg",
      subject: "Breaking news: Headline",
      url: "https://www.theguardian.com/world/2026/jul/10/story",
    };

    expect(createBrazePayload(article, "campaign-123")).toEqual({
      campaign_id: "campaign-123",
      trigger_properties: {
        body: expect.stringContaining("Body copy"),
        subject: "Breaking news: Headline",
      },
      recipients: [
        {
          email: "marcin.gosz@guardian.co.uk",
          prioritization: ["unidentified", "most_recently_updated"],
          attributes: {
            email: "marcin.gosz@guardian.co.uk",
          },
          send_to_existing_only: false,
        },
      ],
    });
  });

  it("injects article content into the breaking news email template", () => {
    const article: GuardianArticle = {
      body: "Body copy",
      brazeEmail: "marcin.gosz@guardian.co.uk",
      headline: "Headline",
      imageUrl: "https://media.guim.co.uk/example.jpg",
      subject: "Breaking news: Headline",
      url: "https://www.theguardian.com/world/2026/jul/10/story",
    };

    const html = renderBreakingNewsTemplate(article);

    expect(html).toContain("Headline");
    expect(html).toContain("Body copy");
    expect(html).toContain("https://media.guim.co.uk/example.jpg");
    expect(html).toContain(
      "https://www.theguardian.com/world/2026/jul/10/story?##braze_utm##",
    );
  });

  it("appends Braze UTM correctly when the article URL already has query params", () => {
    const article: GuardianArticle = {
      body: "Body copy",
      brazeEmail: "marcin.gosz@guardian.co.uk",
      headline: "Headline",
      imageUrl: "https://media.guim.co.uk/example.jpg",
      subject: "Breaking news: Headline",
      url: "https://www.theguardian.com/world/2026/jul/10/story?existing=1",
    };

    const html = renderBreakingNewsTemplate(article);

    expect(html).toContain(
      "https://www.theguardian.com/world/2026/jul/10/story?existing=1&amp;##braze_utm##",
    );
  });
});

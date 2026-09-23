ALTER TABLE "notifications" ADD COLUMN "article_id" text;--> statement-breakpoint
UPDATE "notifications"
SET "article_id" = (
	SELECT CASE
		WHEN count(DISTINCT composed_article.article_id) = 1
			THEN min(composed_article.article_id)
		ELSE NULL
	END
	FROM (
		SELECT trim(both '/' from regexp_replace(
			split_part(split_part(composed_link.link, '#', 1), '?', 1),
			'^https?://[^/]+/?',
			''
		)) AS article_id
		FROM (
			SELECT "notifications"."content"->'items'->("notifications"."channels"->'app-push'->'compose'->>'use')->>'link' AS link
			UNION ALL
			SELECT "notifications"."content"->'items'->newsletter_item.value->>'link' AS link
			FROM jsonb_array_elements_text(
				coalesce("notifications"."channels"->'newsletter'->'compose'->'items', '[]'::jsonb)
			) AS newsletter_item
		) AS composed_link
		WHERE composed_link.link IS NOT NULL
	) AS composed_article
	WHERE composed_article.article_id <> ''
);--> statement-breakpoint
CREATE INDEX "notifications_send_article_id_created_at_idx" ON "notifications" USING btree ("article_id","created_at" DESC NULLS LAST) WHERE "notifications"."kind" = 'send' and "notifications"."article_id" is not null;
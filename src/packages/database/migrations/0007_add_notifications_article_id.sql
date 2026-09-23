ALTER TABLE "notifications" ADD COLUMN "article_id" text;--> statement-breakpoint
UPDATE "notifications"
SET "article_id" = (
	SELECT trim(both '/' from regexp_replace(
		split_part(split_part(content_item.value->>'link', '#', 1), '?', 1),
		'^https?://[^/]+/?',
		''
	))
	FROM jsonb_each(coalesce("notifications"."content"->'items', '{}'::jsonb)) AS content_item
	WHERE content_item.value->>'link' IS NOT NULL
	LIMIT 1
);--> statement-breakpoint
CREATE INDEX "notifications_send_article_id_created_at_idx" ON "notifications" USING btree ("article_id","created_at" DESC NULLS LAST) WHERE "notifications"."kind" = 'send' and "notifications"."article_id" is not null;
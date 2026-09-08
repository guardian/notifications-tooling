ALTER TABLE "notification_dispatches" ADD COLUMN "requested" jsonb;--> statement-breakpoint
ALTER TABLE "notification_dispatches" ADD COLUMN "resolved" jsonb;--> statement-breakpoint
-- Back-fill the structured columns from the previous encodings. Two historical
-- formats exist: the earliest stored app-push `target` = '<topicType>' with a
-- null detail and newsletter detail = `{ campaignId }`; a later format stored
-- app-push `target` = '<topicType>/<edition>,<edition>' with detail
-- `{ topics, importance }` and newsletter detail = `{ campaignId?, emailRenderingId }`.
--
-- `requested` (what the consumer asked for) is recovered from the original
-- request on `notifications.channels`, which is authoritative and complete for
-- both formats: editions come from the app-push audience for the topic type.
-- `resolved` (downstream values) is recovered only from `detail`; the earliest
-- rows never stored it, so absent fields are omitted rather than invented.
UPDATE "notification_dispatches" AS d SET
	"requested" = CASE d."channel"
		WHEN 'app-push' THEN jsonb_build_object(
			'channel', 'app-push',
			'topicType', split_part(d."target", '/', 1),
			'editions', CASE
				-- Later format: editions are encoded in the target after the '/'.
				WHEN strpos(d."target", '/') > 0 THEN CASE
					WHEN split_part(d."target", '/', 2) = '' THEN '[]'::jsonb
					ELSE to_jsonb(string_to_array(split_part(d."target", '/', 2), ','))
				END
				-- Earlier format: recover the editions from the request audience.
				ELSE COALESCE((
					SELECT jsonb_agg(item ->> 'name')
					FROM "notifications" AS n
					CROSS JOIN LATERAL jsonb_array_elements(
						COALESCE(n."channels" -> 'app-push' -> 'audience' -> 'items', '[]'::jsonb)
					) AS item
					WHERE n."id" = d."notification_id"
						AND item ->> 'type' = d."target"
				), '[]'::jsonb)
			END
		)
		ELSE jsonb_build_object('channel', 'newsletter', 'segment', d."target")
	END,
	"resolved" = CASE d."channel"
		WHEN 'app-push' THEN jsonb_strip_nulls(jsonb_build_object(
			'channel', 'app-push',
			'topics', COALESCE(d."detail" -> 'topics', '[]'::jsonb),
			-- Importance is fixed per topic type and identical across stages, so it
			-- is recovered from a lookup when the earliest rows did not store it.
			'importance', COALESCE(d."detail" ->> 'importance', (
				SELECT imp FROM (VALUES
					('breaking-news', 'Major'),
					('sport', 'Minor'),
					('editors-picks', 'Minor'),
					('one-not-to-miss', 'Minor')
				) AS topic_importance(topic_type, imp)
				WHERE topic_importance.topic_type = split_part(d."target", '/', 1)
			))
		))
		ELSE jsonb_strip_nulls(jsonb_build_object(
			'channel', 'newsletter',
			'brazeCampaignId', d."detail" ->> 'campaignId',
			-- The email-rendering id was not stored on the earliest rows; recover it
			-- from the Braze campaign id, which is unique per stage and segment.
			'emailRenderingId', COALESCE(d."detail" ->> 'emailRenderingId', (
				SELECT erid FROM (VALUES
					('da019800-869e-4e1d-9c2e-029741829af1', 'breaking-news-uk'),
					('a945e3ae-165b-46d7-b163-0ca1c6beb2f4', 'breakingnewsus'),
					('5da1b754-42f4-440d-9eec-0d595190a0f0', 'breaking-news-au'),
					('93b0c12d-8c7e-43be-b3b5-88a149ba511f', 'breaking-news-us'),
					('149aa55d-570a-40a5-82d4-8f44a713ad58', 'breaking-news-australia')
				) AS campaign_rendering(campaign_id, erid)
				WHERE campaign_rendering.campaign_id = d."detail" ->> 'campaignId'
			))
		))
	END;--> statement-breakpoint
-- App-push `topics` (the mobile-n10n coordinates) were not stored on the earliest
-- rows and are stage-specific, so they are rebuilt per recovered edition from the
-- PROD topic coordinates. Only rows still missing topics are touched.
UPDATE "notification_dispatches" AS d SET
	"resolved" = jsonb_set(d."resolved", '{topics}', COALESCE((
		SELECT jsonb_agg(
			jsonb_build_object('type', topic_map.topic_type_value, 'name', topic_map.topic_name)
			ORDER BY edition.ord
		)
		FROM jsonb_array_elements_text(d."requested" -> 'editions')
			WITH ORDINALITY AS edition(name, ord)
		JOIN (VALUES
			('editors-picks', 'uk', 'breaking', 'uk-editors-picks'),
			('editors-picks', 'us', 'breaking', 'us-editors-picks'),
			('editors-picks', 'au', 'breaking', 'au-editors-picks'),
			('editors-picks', 'international', 'breaking', 'international-editors-picks'),
			('editors-picks', 'europe', 'breaking', 'europe-editors-picks')
		) AS topic_map(topic_type, edition, topic_type_value, topic_name)
			ON topic_map.topic_type = (d."requested" ->> 'topicType')
				AND topic_map.edition = edition.name
	), '[]'::jsonb))
	WHERE d."channel" = 'app-push' AND d."resolved" -> 'topics' = '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "notification_dispatches" ALTER COLUMN "requested" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_dispatches" ALTER COLUMN "resolved" SET NOT NULL;--> statement-breakpoint
DROP INDEX "notification_dispatches_notification_channel_target_unique";--> statement-breakpoint
ALTER TABLE "notification_dispatches" DROP COLUMN "target";--> statement-breakpoint
ALTER TABLE "notification_dispatches" DROP COLUMN "detail";--> statement-breakpoint
CREATE UNIQUE INDEX "notification_dispatches_notification_requested_unique" ON "notification_dispatches" USING btree ("notification_id","requested");

ALTER TABLE "notification_dispatches" ADD COLUMN "requested" jsonb;--> statement-breakpoint
ALTER TABLE "notification_dispatches" ADD COLUMN "resolved" jsonb;--> statement-breakpoint
-- Back-fill the structured columns from the previous `target`/`detail` encoding.
-- App-push targets were '<topicType>/<edition>,<edition>' with detail
-- `{ topics, importance }`; newsletter targets were the segment with detail
-- `{ campaignId?, emailRenderingId }`.
UPDATE "notification_dispatches" SET
	"requested" = CASE "channel"
		WHEN 'app-push' THEN jsonb_build_object(
			'channel', 'app-push',
			'topicType', split_part("target", '/', 1),
			'editions', CASE
				WHEN split_part("target", '/', 2) = '' THEN '[]'::jsonb
				ELSE to_jsonb(string_to_array(split_part("target", '/', 2), ','))
			END
		)
		ELSE jsonb_build_object('channel', 'newsletter', 'segment', "target")
	END,
	"resolved" = CASE "channel"
		WHEN 'app-push' THEN jsonb_build_object(
			'channel', 'app-push',
			'topics', COALESCE("detail" -> 'topics', '[]'::jsonb),
			'importance', COALESCE("detail" ->> 'importance', 'Minor')
		)
		ELSE jsonb_strip_nulls(jsonb_build_object(
			'channel', 'newsletter',
			'brazeCampaignId', "detail" ->> 'campaignId',
			'emailRenderingId', COALESCE("detail" ->> 'emailRenderingId', '')
		))
	END;--> statement-breakpoint
ALTER TABLE "notification_dispatches" ALTER COLUMN "requested" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_dispatches" ALTER COLUMN "resolved" SET NOT NULL;--> statement-breakpoint
DROP INDEX "notification_dispatches_notification_channel_target_unique";--> statement-breakpoint
ALTER TABLE "notification_dispatches" DROP COLUMN "target";--> statement-breakpoint
ALTER TABLE "notification_dispatches" DROP COLUMN "detail";--> statement-breakpoint
CREATE UNIQUE INDEX "notification_dispatches_notification_requested_unique" ON "notification_dispatches" USING btree ("notification_id","requested");

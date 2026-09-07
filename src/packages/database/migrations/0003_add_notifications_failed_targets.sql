ALTER TABLE "notifications" ADD COLUMN "failed_targets" jsonb DEFAULT '{"topics":[],"segments":[]}'::jsonb NOT NULL;--> statement-breakpoint
-- Backfill existing rows from their recorded failed dispatch outcomes. Rows with
-- no failed dispatches keep the empty default set by the ADD COLUMN above.
-- App-push topics are expanded to { topicType, edition } key pairs from the
-- dispatch's recorded editions; newsletter segments to { segmentId } keys.
-- Dispatches predating edition recording (no detail->'editions') contribute no
-- topics, since the editions they addressed were never stored.
UPDATE "notifications" AS n
SET "failed_targets" = agg.failed
FROM (
	SELECT
		d."notification_id",
		jsonb_build_object(
			'topics',
			COALESCE(
				jsonb_agg(
					DISTINCT jsonb_build_object('topicType', d."target", 'edition', edition.value)
				) FILTER (WHERE d."channel" = 'app-push' AND edition.value IS NOT NULL),
				'[]'::jsonb
			),
			'segments',
			COALESCE(
				jsonb_agg(DISTINCT jsonb_build_object('segmentId', d."target"))
					FILTER (WHERE d."channel" = 'newsletter'),
				'[]'::jsonb
			)
		) AS failed
	FROM "notification_dispatches" AS d
	LEFT JOIN LATERAL jsonb_array_elements_text(d."detail" -> 'editions') AS edition(value)
		ON d."channel" = 'app-push'
	WHERE d."status" = 'failure'
	GROUP BY d."notification_id"
) AS agg
WHERE n."id" = agg."notification_id";

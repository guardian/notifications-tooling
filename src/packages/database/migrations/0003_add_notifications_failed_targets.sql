ALTER TABLE "notifications" ADD COLUMN "failed_targets" jsonb DEFAULT '{"topics":[],"segments":[]}'::jsonb NOT NULL;--> statement-breakpoint
-- Backfill existing rows from their recorded failed dispatch outcomes. Rows with
-- no failed dispatches keep the empty default set by the ADD COLUMN above.
-- App-push targets are stored as '<topicType>/<edition>,<edition>', so the topic
-- type and its editions are parsed back off the target string and expanded into
-- { topicType, edition } key pairs; newsletter segments to { segmentId } keys.
-- Targets with no editions (a bare topic type) contribute no topics.
UPDATE "notifications" AS n
SET "failed_targets" = agg.failed
FROM (
	SELECT
		d."notification_id",
		jsonb_build_object(
			'topics',
			COALESCE(
				jsonb_agg(
					DISTINCT jsonb_build_object(
						'topicType', split_part(d."target", '/', 1),
						'edition', edition.value
					)
				) FILTER (
					WHERE d."channel" = 'app-push'
						AND edition.value IS NOT NULL
						AND edition.value <> ''
				),
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
	LEFT JOIN LATERAL unnest(
		string_to_array(split_part(d."target", '/', 2), ',')
	) AS edition(value)
		ON d."channel" = 'app-push'
	WHERE d."status" = 'failure'
	GROUP BY d."notification_id"
) AS agg
WHERE n."id" = agg."notification_id";

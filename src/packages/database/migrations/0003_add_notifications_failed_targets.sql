ALTER TABLE "notifications" ADD COLUMN "failed_targets" jsonb DEFAULT '{"topics":[],"segments":[]}'::jsonb NOT NULL;--> statement-breakpoint

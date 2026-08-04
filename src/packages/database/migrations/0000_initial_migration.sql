CREATE TYPE "public"."notification_status" AS ENUM('accepted');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "notification_status" DEFAULT 'accepted' NOT NULL,
	"sender" text NOT NULL,
	"dry_run" boolean DEFAULT false NOT NULL,
	"scheduled_for" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_idempotency_key_unique" ON "notifications" USING btree ("idempotency_key");
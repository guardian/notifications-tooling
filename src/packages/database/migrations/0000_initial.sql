CREATE TYPE "public"."dispatch_status" AS ENUM('success', 'failure');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('newsletter', 'app-push');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('send', 'test');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('accepted', 'delivered', 'partially_delivered', 'failed');--> statement-breakpoint
CREATE TABLE "notification_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"target" text NOT NULL,
	"provider_ref" text,
	"status" "dispatch_status" NOT NULL,
	"failure_reason" text,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" text NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"status" "notification_status" DEFAULT 'accepted' NOT NULL,
	"sender" text NOT NULL,
	"created_by_email" text NOT NULL,
	"dry_run" boolean DEFAULT false NOT NULL,
	"scheduled_for" timestamp with time zone,
	"content" jsonb NOT NULL,
	"channels" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_dispatches" ADD CONSTRAINT "notification_dispatches_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_dispatches_notification_channel_target_unique" ON "notification_dispatches" USING btree ("notification_id","channel","target");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_idempotency_key_unique" ON "notifications" USING btree ("idempotency_key");
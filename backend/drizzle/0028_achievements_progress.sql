ALTER TYPE "public"."notification_type" ADD VALUE 'new_subscriber' BEFORE 'tagged_in_post';--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "type" "user_activity";--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "measuring_unit" "measuring_unit";--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "progress" smallint DEFAULT 0 NOT NULL;
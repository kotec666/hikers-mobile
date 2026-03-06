CREATE TYPE "public"."notification_type" AS ENUM('trainig_invite', 'friend_invite', 'tagged_in_post', 'ACHIEVEMENT');--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "action" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type" "notification_type" NOT NULL;
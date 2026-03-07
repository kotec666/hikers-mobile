ALTER TABLE "notifications" DROP CONSTRAINT "notifications_icon_filename_media_filename_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "action" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "icon_filename";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "text";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."notification_type";
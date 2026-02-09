ALTER TABLE "post_media" DROP CONSTRAINT "post_media_post_id_media_filename_pk";--> statement-breakpoint
ALTER TABLE "post_media" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;
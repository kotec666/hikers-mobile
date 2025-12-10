ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_media_filename_fk";
--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "posts" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "post_one_per_participant" UNIQUE("training_id","user_creator_id");
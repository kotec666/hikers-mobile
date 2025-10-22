ALTER TABLE "user_achievments" RENAME COLUMN "created_at" TO "claimed_at";--> statement-breakpoint
ALTER TABLE "user_achievments" ADD COLUMN "progress" smallint DEFAULT 0 NOT NULL;
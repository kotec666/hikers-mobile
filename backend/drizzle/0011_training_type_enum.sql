CREATE TYPE "public"."training_type" AS ENUM('run', 'track', 'bicycle');--> statement-breakpoint
ALTER TABLE "training" ALTER COLUMN "type" SET DATA TYPE "public"."training_type" USING "type"::"public"."training_type";--> statement-breakpoint

ALTER TABLE "training_types" ALTER COLUMN "name" SET DATA TYPE "public"."training_type" USING "name"::"public"."training_type";--> statement-breakpoint
ALTER TABLE "user_activities" ALTER COLUMN "type" SET DATA TYPE "public"."training_type" USING "type"::"public"."training_type";
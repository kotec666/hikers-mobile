CREATE TYPE "public"."measuring_unit" AS ENUM('m', 'km', 'cnt', 'reps');--> statement-breakpoint
CREATE TYPE "public"."user_activity" AS ENUM('run', 'track', 'bicycle', 'steps');--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_type_training_types_name_fk";
--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_user_id_type_pk";--> statement-breakpoint
ALTER TABLE "training_types" ALTER COLUMN "measuring_unit" SET DATA TYPE "public"."measuring_unit" USING "measuring_unit"::"public"."measuring_unit";--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_name_pk" PRIMARY KEY("user_id","name");--> statement-breakpoint
ALTER TABLE "user_activities" ADD COLUMN "name" "user_activity" NOT NULL;--> statement-breakpoint
ALTER TABLE "user_activities" ADD COLUMN "measuring_unit" "measuring_unit" NOT NULL;--> statement-breakpoint
ALTER TABLE "user_activities" DROP COLUMN "type";
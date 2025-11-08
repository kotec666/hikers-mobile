ALTER TABLE "training_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "training_types" CASCADE;--> statement-breakpoint
ALTER TABLE "training" DROP CONSTRAINT "training_type_training_types_name_fk";
--> statement-breakpoint
ALTER TABLE "training_metrics" ALTER COLUMN "time_min" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" ALTER COLUMN "avg_speed_kmh" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" ALTER COLUMN "avg_tempo_seconds_per_km" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" ALTER COLUMN "distance_m" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" ALTER COLUMN "altitude_gain_m" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" ALTER COLUMN "kkcal" SET NOT NULL;
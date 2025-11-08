ALTER TABLE "training_metrics" ADD COLUMN "avg_tempo_seconds_per_km" smallint;--> statement-breakpoint
ALTER TABLE "training_metrics" DROP COLUMN "avg_tempo_per_km";
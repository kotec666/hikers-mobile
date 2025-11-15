ALTER TABLE "training_metrics" ADD COLUMN "time_sec" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" ADD COLUMN "avg_speed_m_per_sec" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "training_metrics" DROP COLUMN "time_min";--> statement-breakpoint
ALTER TABLE "training_metrics" DROP COLUMN "avg_speed_kmh";--> statement-breakpoint
ALTER TABLE "training_metrics" ADD CONSTRAINT "training_metrics_participant_id_unique" UNIQUE("participant_id");
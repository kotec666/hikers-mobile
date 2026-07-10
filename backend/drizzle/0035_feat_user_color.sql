ALTER TABLE "users" ADD COLUMN "color" varchar(20) DEFAULT 'rgb(34,203,90)' NOT NULL;--> statement-breakpoint
ALTER TABLE "training_participants" DROP COLUMN "color_hex";
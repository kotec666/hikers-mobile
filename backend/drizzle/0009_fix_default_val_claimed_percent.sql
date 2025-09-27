ALTER TABLE "achievements" ALTER COLUMN "claimed_percent" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "claimed_percent" SET NOT NULL;
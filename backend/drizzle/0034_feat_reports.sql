CREATE TYPE "public"."report_type" AS ENUM('common', 'to_user', 'to_post', 'to_media', 'to_training');--> statement-breakpoint
CREATE TABLE "report_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"media_filename" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" uuid NOT NULL,
	"type" "report_type" NOT NULL,
	"addons" jsonb,
	"text" varchar(4095),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_media" ADD CONSTRAINT "report_media_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_media" ADD CONSTRAINT "report_media_media_filename_media_filename_fk" FOREIGN KEY ("media_filename") REFERENCES "public"."media"("filename") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rpt_usr_idx" ON "reports" USING btree ("from_user_id");
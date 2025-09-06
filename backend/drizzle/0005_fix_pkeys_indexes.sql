DROP INDEX "media_name_idx";--> statement-breakpoint
DROP INDEX "post_mdeia_idx";--> statement-breakpoint
DROP INDEX "post_idx";--> statement-breakpoint
DROP INDEX "tokens_usr_idx";--> statement-breakpoint
DROP INDEX "trn_idx";--> statement-breakpoint
DROP INDEX "trn_metr_idx";--> statement-breakpoint
DROP INDEX "trn_route_idx";--> statement-breakpoint
DROP INDEX "achv_idx";--> statement-breakpoint
DROP INDEX "activ_usr_idx";--> statement-breakpoint
DROP INDEX "usr_id_idx";--> statement-breakpoint
CREATE INDEX "trn_metr_part_idx" ON "training_metrics" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "usr_uname_idx" ON "users" USING gin ("username");
ALTER TABLE "achievements" DROP CONSTRAINT "achievements_id_unique";--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_id_unique";--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_filename_unique";--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_id_unique";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_id_unique";--> statement-breakpoint
ALTER TABLE "testing" DROP CONSTRAINT "testing_id_unique";--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_unique";--> statement-breakpoint
ALTER TABLE "training" DROP CONSTRAINT "training_id_unique";--> statement-breakpoint
ALTER TABLE "training_invites" DROP CONSTRAINT "training_invites_id_unique";--> statement-breakpoint
ALTER TABLE "training_metrics" DROP CONSTRAINT "training_metrics_id_unique";--> statement-breakpoint
ALTER TABLE "training_participants" DROP CONSTRAINT "training_participants_id_unique";--> statement-breakpoint
ALTER TABLE "training_routes" DROP CONSTRAINT "training_routes_id_unique";--> statement-breakpoint
ALTER TABLE "training_types" DROP CONSTRAINT "training_types_name_unique";--> statement-breakpoint
ALTER TABLE "user_friends_invites" DROP CONSTRAINT "user_friends_invites_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_unique";--> statement-breakpoint
DROP INDEX "usr_name_idx";--> statement-breakpoint
DROP INDEX "usr_uname_idx";--> statement-breakpoint
CREATE INDEX "usr_name_idx" ON "users" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "usr_uname_idx" ON "users" USING gin ("username" gin_trgm_ops);
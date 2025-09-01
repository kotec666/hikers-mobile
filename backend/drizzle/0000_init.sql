CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"icon_filename" varchar(255),
	"color_hex" varchar(7),
	"title" varchar(255) NOT NULL,
	"description" text,
	"claimed_percent" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"filename" varchar(255) PRIMARY KEY NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"filetype" varchar(63),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"icon_filename" varchar(255),
	"to_user_id" uuid NOT NULL,
	"text" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"readed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "post_media" (
	"post_id" uuid NOT NULL,
	"media_filename" varchar(255) NOT NULL,
	CONSTRAINT "post_media_post_id_media_filename_pk" PRIMARY KEY("post_id","media_filename")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" uuid,
	"user_creator_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "testing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_creator_id" uuid NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "training_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"time_min" integer,
	"avg_speed_kmh" smallint,
	"avg_tempo_min_sec" numeric(4, 2),
	"distance_m" integer,
	"altitude_gain_m" smallint,
	"kkcal" smallint
);
--> statement-breakpoint
CREATE TABLE "training_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"training_id" uuid NOT NULL,
	"color_hex" varchar(7)
);
--> statement-breakpoint
CREATE TABLE "training_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "training_types" (
	"name" varchar(127) PRIMARY KEY NOT NULL,
	"measuring_unit" varchar(31) NOT NULL,
	"icon_filename" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "user_achievments" (
	"user_id" uuid NOT NULL,
	"achievment_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievments_user_id_achievment_id_pk" PRIMARY KEY("user_id","achievment_id")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"user_id" uuid NOT NULL,
	"place_for_show" smallint,
	"type" varchar NOT NULL,
	"goal" integer NOT NULL,
	CONSTRAINT "user_activities_user_id_type_pk" PRIMARY KEY("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "user_friends" (
	"user_id" uuid NOT NULL,
	"user_friend_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_friends_user_id_user_friend_id_pk" PRIMARY KEY("user_id","user_friend_id")
);
--> statement-breakpoint
CREATE TABLE "user_friends_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscribers" (
	"user_id" uuid NOT NULL,
	"user_subscriber_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscribers_user_id_user_subscriber_id_pk" PRIMARY KEY("user_id","user_subscriber_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(63) NOT NULL,
	"avatar_filename" varchar(255),
	"terms_accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_icon_filename_media_filename_fk" FOREIGN KEY ("icon_filename") REFERENCES "public"."media"("filename") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_icon_filename_media_filename_fk" FOREIGN KEY ("icon_filename") REFERENCES "public"."media"("filename") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_media_filename_media_filename_fk" FOREIGN KEY ("media_filename") REFERENCES "public"."media"("filename") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_creator_id_users_id_fk" FOREIGN KEY ("user_creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training" ADD CONSTRAINT "training_user_creator_id_users_id_fk" FOREIGN KEY ("user_creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training" ADD CONSTRAINT "training_type_training_types_name_fk" FOREIGN KEY ("type") REFERENCES "public"."training_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_invites" ADD CONSTRAINT "training_invites_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_invites" ADD CONSTRAINT "training_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_invites" ADD CONSTRAINT "training_invites_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_metrics" ADD CONSTRAINT "training_metrics_participant_id_training_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."training_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_routes" ADD CONSTRAINT "training_routes_participant_id_training_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."training_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_types" ADD CONSTRAINT "training_types_icon_filename_media_filename_fk" FOREIGN KEY ("icon_filename") REFERENCES "public"."media"("filename") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievments" ADD CONSTRAINT "user_achievments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievments" ADD CONSTRAINT "user_achievments_achievment_id_achievements_id_fk" FOREIGN KEY ("achievment_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_type_training_types_name_fk" FOREIGN KEY ("type") REFERENCES "public"."training_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_user_friend_id_users_id_fk" FOREIGN KEY ("user_friend_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friends_invites" ADD CONSTRAINT "user_friends_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friends_invites" ADD CONSTRAINT "user_friends_invites_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscribers" ADD CONSTRAINT "user_subscribers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscribers" ADD CONSTRAINT "user_subscribers_user_subscriber_id_users_id_fk" FOREIGN KEY ("user_subscriber_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_filename_media_filename_fk" FOREIGN KEY ("avatar_filename") REFERENCES "public"."media"("filename") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_name_idx" ON "media" USING btree ("filename");--> statement-breakpoint
CREATE INDEX "ntf_usr_idx" ON "notifications" USING btree ("to_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_mdeia_idx" ON "post_media" USING btree ("post_id","media_filename");--> statement-breakpoint
CREATE UNIQUE INDEX "post_idx" ON "posts" USING btree ("id");--> statement-breakpoint
CREATE INDEX "post_usr_idx" ON "posts" USING btree ("user_creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trn_idx" ON "training" USING btree ("id");--> statement-breakpoint
CREATE INDEX "trn_metr_idx" ON "training_metrics" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trn_part_idx" ON "training_participants" USING btree ("user_id","training_id");--> statement-breakpoint
CREATE INDEX "trn_route_idx" ON "training_routes" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "achv_idx" ON "user_achievments" USING btree ("user_id","achievment_id");--> statement-breakpoint
CREATE INDEX "activ_usr_idx" ON "user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usr_id_idx" ON "users" USING btree ("id");
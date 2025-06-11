CREATE TYPE "public"."hashtag_status" AS ENUM('active', 'closed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."hashtag_type" AS ENUM('common', 'expiration');--> statement-breakpoint
CREATE TABLE "clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"editor_id" uuid NOT NULL,
	"social_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"url" varchar(255) NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp NOT NULL,
	"freshed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clips_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "clips_creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clip_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clips_hastags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clip_id" uuid NOT NULL,
	"hashtag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"twitch_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editor_socials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"editor_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"username" varchar(255) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	CONSTRAINT "editor_socials_editor_id_platform_id_unique" UNIQUE("editor_id","platform_id"),
	CONSTRAINT "editor_socials_platform_id_username_unique" UNIQUE("platform_id","username")
);
--> statement-breakpoint
CREATE TABLE "editors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "hashtags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(127) NOT NULL,
	"creator_id" uuid NOT NULL,
	"type" "hashtag_type" NOT NULL,
	"status" "hashtag_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hashtags_name_created_at_unique" UNIQUE("name","created_at")
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(127) NOT NULL,
	CONSTRAINT "platforms_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"refresh_token" varchar(511) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_editor_id_editors_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."editors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_social_id_editor_socials_id_fk" FOREIGN KEY ("social_id") REFERENCES "public"."editor_socials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips_creators" ADD CONSTRAINT "clips_creators_clip_id_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips_creators" ADD CONSTRAINT "clips_creators_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips_hastags" ADD CONSTRAINT "clips_hastags_clip_id_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips_hastags" ADD CONSTRAINT "clips_hastags_hashtag_id_hashtags_id_fk" FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_socials" ADD CONSTRAINT "editor_socials_editor_id_editors_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."editors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_socials" ADD CONSTRAINT "editor_socials_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editors" ADD CONSTRAINT "editors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hashtags" ADD CONSTRAINT "hashtags_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
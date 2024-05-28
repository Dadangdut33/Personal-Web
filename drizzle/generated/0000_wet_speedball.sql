CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_temp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionId" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(2048) NOT NULL,
	"description" text NOT NULL,
	"content" json NOT NULL,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"categoryId" uuid,
	"thumbnailId" uuid,
	"authorId" uuid NOT NULL,
	"lastEditorId" uuid,
	"visibility" "visibility" DEFAULT 'DRAFT' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_revision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(2048) NOT NULL,
	"description" text NOT NULL,
	"content" json NOT NULL,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"categoryId" uuid,
	"thumbnailId" uuid,
	"authorId" uuid NOT NULL,
	"lastEditorId" uuid,
	"visibility" "visibility" DEFAULT 'DRAFT' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"revision" integer NOT NULL,
	"blogId" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_like" (
	"blogId" uuid PRIMARY KEY NOT NULL,
	"likes" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(2048) NOT NULL,
	"description" text,
	"type" "type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"originalHash" varchar(2048) NOT NULL,
	"file" json NOT NULL,
	"category" "category" NOT NULL,
	CONSTRAINT "file_originalHash_unique" UNIQUE("originalHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"avatarId" uuid,
	"name" varchar(2048) NOT NULL,
	"title" varchar(2048),
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(2048) NOT NULL,
	"description" text NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"links" json DEFAULT '[]'::json,
	"position" integer DEFAULT 0 NOT NULL,
	"categoryId" uuid,
	"thumbnailId" uuid,
	"visibility" "visibility" DEFAULT 'DRAFT' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(2048) NOT NULL,
	"hashedPassword" varchar(2048) NOT NULL,
	"twoFactorSecret" varchar(2048),
	"role" "role" DEFAULT 'USER' NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_two_factor_backup_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"codes" varchar(2048) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shortlink" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"shorten" text NOT NULL,
	CONSTRAINT "shortlink_shorten_unique" UNIQUE("shorten")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_temp" ADD CONSTRAINT "session_temp_sessionId_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog" ADD CONSTRAINT "blog_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog" ADD CONSTRAINT "blog_thumbnailId_file_id_fk" FOREIGN KEY ("thumbnailId") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog" ADD CONSTRAINT "blog_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog" ADD CONSTRAINT "blog_lastEditorId_user_id_fk" FOREIGN KEY ("lastEditorId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_thumbnailId_file_id_fk" FOREIGN KEY ("thumbnailId") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_lastEditorId_user_id_fk" FOREIGN KEY ("lastEditorId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_blogId_blog_id_fk" FOREIGN KEY ("blogId") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_like" ADD CONSTRAINT "blog_like_blogId_blog_id_fk" FOREIGN KEY ("blogId") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_avatarId_file_id_fk" FOREIGN KEY ("avatarId") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_thumbnailId_file_id_fk" FOREIGN KEY ("thumbnailId") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_two_factor_backup_codes" ADD CONSTRAINT "user_two_factor_backup_codes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

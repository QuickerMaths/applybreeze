DO $$ BEGIN
 CREATE TYPE "public"."applicationStatus" AS ENUM('saved', 'applied', 'interviewing', 'rejected', 'accepted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."jobSources" AS ENUM('indeed', 'linkedin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"job_id" integer NOT NULL,
	"applicationStatus" "applicationStatus" DEFAULT 'saved' NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"applied_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "JobSearchRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"saved_search_id" integer NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"city" varchar(255),
	"salary" varchar(255) DEFAULT 'Unknown' NOT NULL,
	"country" varchar(255),
	"source" varchar(255) NOT NULL,
	"source_url" varchar(1024),
	"seniority_level" varchar(255) DEFAULT 'Unknown' NOT NULL,
	"company_name" varchar(255),
	"description" text,
	"url" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SavedSearchJobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"saved_search_id" integer NOT NULL,
	"job_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SavedSearches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(255),
	"city" varchar(255),
	"country" varchar(255),
	"seniority_level" varchar(255),
	"saved_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Applications" ADD CONSTRAINT "Applications_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Applications" ADD CONSTRAINT "Applications_job_id_Jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."Jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "JobSearchRequest" ADD CONSTRAINT "JobSearchRequest_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "JobSearchRequest" ADD CONSTRAINT "JobSearchRequest_saved_search_id_SavedSearches_id_fk" FOREIGN KEY ("saved_search_id") REFERENCES "public"."SavedSearches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SavedSearchJobs" ADD CONSTRAINT "SavedSearchJobs_saved_search_id_SavedSearches_id_fk" FOREIGN KEY ("saved_search_id") REFERENCES "public"."SavedSearches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SavedSearchJobs" ADD CONSTRAINT "SavedSearchJobs_job_id_Jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."Jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SavedSearches" ADD CONSTRAINT "SavedSearches_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

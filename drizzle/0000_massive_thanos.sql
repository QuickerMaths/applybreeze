CREATE TABLE IF NOT EXISTS "Applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"job_id" integer,
	"status" varchar(50),
	"applied_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "JobFilters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"country" varchar(255),
	"seniority_level" varchar(255),
	"keywords" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"city" varchar(255),
	"salary" varchar(255),
	"country" varchar(255),
	"source" varchar(255),
	"source_url" varchar(1024),
	"seniority_level" varchar(255),
	"company_name" varchar(255),
	"description" text,
	"url" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Users_username_unique" UNIQUE("username"),
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
 ALTER TABLE "JobFilters" ADD CONSTRAINT "JobFilters_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

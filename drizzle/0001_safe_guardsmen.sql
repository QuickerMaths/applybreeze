CREATE TABLE IF NOT EXISTS "JobApplicationAnalytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"saved_applications" integer NOT NULL,
	"applied_applications" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "JobApplicationAnalytics" ADD CONSTRAINT "JobApplicationAnalytics_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

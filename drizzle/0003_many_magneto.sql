CREATE TABLE IF NOT EXISTS "WeeklyGoal" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ApplicationsAnalytics" ALTER COLUMN "saved_applications" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ApplicationsAnalytics" ALTER COLUMN "applied_applications" SET DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WeeklyGoal" ADD CONSTRAINT "WeeklyGoal_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

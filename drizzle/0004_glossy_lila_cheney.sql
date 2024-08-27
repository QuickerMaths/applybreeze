ALTER TABLE "WeeklyGoal" RENAME COLUMN "number" TO "goal";--> statement-breakpoint
ALTER TABLE "WeeklyGoal" ALTER COLUMN "goal" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "WeeklyGoal" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;
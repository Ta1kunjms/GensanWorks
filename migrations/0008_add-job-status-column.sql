ALTER TABLE "jobs" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
UPDATE "jobs" SET "status" = COALESCE("status", 'pending');
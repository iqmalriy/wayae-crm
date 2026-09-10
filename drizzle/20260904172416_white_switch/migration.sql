ALTER TABLE "tasks" ADD COLUMN "requires_approval" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "review_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "approved_by_id" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "tasks_review_status_idx" ON "tasks" ("review_status");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_approved_by_id_user_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "user"("id") ON DELETE SET NULL;
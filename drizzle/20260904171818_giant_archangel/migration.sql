CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lead_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assignee_id" text,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "lead_activities" DROP COLUMN "due_at";--> statement-breakpoint
ALTER TABLE "lead_activities" DROP COLUMN "completed_at";--> statement-breakpoint
ALTER TABLE "lead_activities" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "lead_activities" DROP COLUMN "deleted_at";--> statement-breakpoint
CREATE INDEX "tasks_lead_id_idx" ON "tasks" ("lead_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" ("status");--> statement-breakpoint
CREATE INDEX "tasks_due_at_idx" ON "tasks" ("due_at");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_leads_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_user_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE SET NULL;
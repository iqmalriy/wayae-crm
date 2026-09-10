ALTER TABLE "leads" ADD COLUMN "assignee_id" text;--> statement-breakpoint
CREATE INDEX "leads_assignee_id_idx" ON "leads" ("assignee_id");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignee_id_user_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE SET NULL;
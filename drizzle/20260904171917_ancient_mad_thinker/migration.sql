ALTER TABLE "tasks" ADD COLUMN "created_by_id" text;--> statement-breakpoint
CREATE INDEX "tasks_created_by_id_idx" ON "tasks" ("created_by_id");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_user_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL;
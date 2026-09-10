ALTER TABLE "leads" ADD COLUMN "stage_changed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "leads_stage_changed_at_idx" ON "leads" ("stage_changed_at");
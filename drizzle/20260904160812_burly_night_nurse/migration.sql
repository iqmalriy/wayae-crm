CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lead_id" uuid NOT NULL,
	"type" text DEFAULT 'note' NOT NULL,
	"body" text,
	"performed_by_id" text,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"from_stage" text,
	"to_stage" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "lead_activities_lead_created_idx" ON "lead_activities" ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "lead_activities_performed_by_idx" ON "lead_activities" ("performed_by_id");--> statement-breakpoint
CREATE INDEX "lead_activities_type_idx" ON "lead_activities" ("type");--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_performed_by_id_user_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "user"("id") ON DELETE SET NULL;
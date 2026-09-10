CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text,
	"company" text,
	"phone_number" text,
	"email" text,
	"stage" text DEFAULT 'new' NOT NULL,
	"source" text DEFAULT 'inbound' NOT NULL,
	"owner_id" text,
	"estimated_value" integer,
	"notes" text,
	"contact_id" uuid,
	"customer_organization_id" text,
	"customer_id" text,
	"won_at" timestamp with time zone,
	"lost_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "leads_owner_id_idx" ON "leads" ("owner_id");--> statement-breakpoint
CREATE INDEX "leads_stage_idx" ON "leads" ("stage");--> statement-breakpoint
CREATE INDEX "leads_source_idx" ON "leads" ("source");--> statement-breakpoint
CREATE INDEX "leads_contact_id_idx" ON "leads" ("contact_id");--> statement-breakpoint
CREATE INDEX "leads_customer_org_id_idx" ON "leads" ("customer_organization_id");--> statement-breakpoint
CREATE INDEX "leads_customer_id_idx" ON "leads" ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_phone_unique_idx" ON "leads" ("phone_number") WHERE "deleted_at" is null;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_contact_id_contacts_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_organization_id_customer_organizations_id_fkey" FOREIGN KEY ("customer_organization_id") REFERENCES "customer_organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL;
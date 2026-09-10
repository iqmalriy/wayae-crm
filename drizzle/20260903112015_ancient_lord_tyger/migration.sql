CREATE TABLE "contact_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"contact_id" uuid NOT NULL,
	"wa_account_id" uuid NOT NULL,
	"user_id" text,
	"first_interaction_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_interaction_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"wa_jid" text NOT NULL,
	"wa_id_type" text DEFAULT 'c_us' NOT NULL,
	"phone_number" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"is_business" boolean DEFAULT false NOT NULL,
	"added_by" text,
	"customer_id" text,
	"source" text DEFAULT 'inbound' NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now(),
	"last_seen_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_organizations" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"legal_name" text,
	"npwp" text,
	"industry" text,
	"address" text,
	"organization_type" text,
	"status" text DEFAULT 'prospect' NOT NULL,
	"account_owner_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"churned_at" timestamp with time zone,
	"prospect_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY,
	"organization_id" text,
	"full_name" text NOT NULL,
	"job_title" text,
	"email" text NOT NULL UNIQUE,
	"department" text,
	"is_decision_maker" boolean DEFAULT false NOT NULL,
	"is_primary_contact" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "contact_interactions_contact_waAccount_idx" ON "contact_interactions" ("contact_id","wa_account_id");--> statement-breakpoint
CREATE INDEX "contact_interactions_waAccountId_idx" ON "contact_interactions" ("wa_account_id");--> statement-breakpoint
CREATE INDEX "contact_interactions_userId_idx" ON "contact_interactions" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_waJid_idx" ON "contacts" ("wa_jid");--> statement-breakpoint
CREATE INDEX "contacts_phoneNumber_idx" ON "contacts" ("phone_number");--> statement-breakpoint
CREATE INDEX "contacts_addedBy_idx" ON "contacts" ("added_by");--> statement-breakpoint
CREATE INDEX "contacts_customerId_idx" ON "contacts" ("customer_id");--> statement-breakpoint
CREATE INDEX "contacts_source_idx" ON "contacts" ("source");--> statement-breakpoint
CREATE INDEX "customer_organizations_accountOwnerId_idx" ON "customer_organizations" ("account_owner_id");--> statement-breakpoint
CREATE INDEX "customers_organizationId_idx" ON "customers" ("organization_id");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" ("email");--> statement-breakpoint
ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_contact_id_contacts_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_wa_account_id_wa_accounts_id_fkey" FOREIGN KEY ("wa_account_id") REFERENCES "wa_accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_added_by_user_id_fkey" FOREIGN KEY ("added_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "customer_organizations" ADD CONSTRAINT "customer_organizations_account_owner_id_user_id_fkey" FOREIGN KEY ("account_owner_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_customer_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "customer_organizations"("id");
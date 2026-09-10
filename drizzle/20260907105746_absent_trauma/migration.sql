CREATE SEQUENCE "public"."leads_lead_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "lead_number" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "leads_lead_number_unique_idx" ON "leads" ("lead_number");
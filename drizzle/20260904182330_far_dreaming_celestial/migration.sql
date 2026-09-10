DROP INDEX "leads_phone_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "leads_phone_unique_idx" ON "leads" ("phone_number") WHERE "deleted_at" is null and "stage" <> 'lost';
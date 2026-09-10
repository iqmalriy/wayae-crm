DROP INDEX "contacts_phoneNumber_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_phoneNumber_unique_idx" ON "contacts" ("phone_number") WHERE "deleted_at" is null;
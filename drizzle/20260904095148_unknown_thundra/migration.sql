DROP INDEX "contacts_waJid_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_waJid_idx" ON "contacts" ("wa_jid") WHERE "deleted_at" is null;
ALTER TABLE "contacts" ALTER COLUMN "wa_jid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "wa_id_type" SET DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "wa_id_type" DROP NOT NULL;
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"wa_account_id" uuid NOT NULL,
	"message_id" text,
	"media_id" text NOT NULL,
	"status" text DEFAULT 'stored' NOT NULL,
	"storage_provider" text,
	"storage_key" text,
	"mimetype" text,
	"filename" text,
	"filesize" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "media_media_id_idx" ON "media" ("media_id");--> statement-breakpoint
CREATE INDEX "media_wa_account_id_idx" ON "media" ("wa_account_id");--> statement-breakpoint
CREATE INDEX "media_message_id_idx" ON "media" ("message_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_wa_account_id_wa_accounts_id_fkey" FOREIGN KEY ("wa_account_id") REFERENCES "wa_accounts"("id") ON DELETE CASCADE;
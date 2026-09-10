CREATE TABLE "wa_account_heartbeats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"wa_account_id" uuid NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "wa_account_heartbeats_account_received_idx" ON "wa_account_heartbeats" ("wa_account_id","received_at");--> statement-breakpoint
CREATE INDEX "wa_account_heartbeats_waAccountId_idx" ON "wa_account_heartbeats" ("wa_account_id");--> statement-breakpoint
ALTER TABLE "wa_account_heartbeats" ADD CONSTRAINT "wa_account_heartbeats_wa_account_id_wa_accounts_id_fkey" FOREIGN KEY ("wa_account_id") REFERENCES "wa_accounts"("id") ON DELETE CASCADE;
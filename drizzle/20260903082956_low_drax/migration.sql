CREATE TABLE "wa_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text,
	"phone" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"token_hash" text NOT NULL,
	"last_heartbeat_at" timestamp with time zone,
	"ext_version" text,
	"protocol_version" text,
	"queue_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wa_account_user_phone_idx" ON "wa_accounts" ("user_id","phone") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "wa_accounts_token_hash_idx" ON "wa_accounts" ("token_hash");--> statement-breakpoint
CREATE INDEX "wa_account_user_idx" ON "wa_accounts" ("user_id");--> statement-breakpoint
ALTER TABLE "wa_accounts" ADD CONSTRAINT "wa_accounts_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;
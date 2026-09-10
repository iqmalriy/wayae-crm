CREATE TABLE "conversation_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"last_read_message_seq" bigint DEFAULT 0 NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"wa_account_id" uuid NOT NULL,
	"contact_id" uuid,
	"chat_id" text NOT NULL,
	"chat_type" text DEFAULT 'chat' NOT NULL,
	"title" text,
	"status" text DEFAULT 'open' NOT NULL,
	"owner_id" text,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp with time zone,
	"last_message_from_me" boolean,
	"last_message_preview" text,
	"closed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"seq" bigserial,
	"conversation_id" uuid NOT NULL,
	"wa_account_id" uuid NOT NULL,
	"owner_id" text,
	"message_id" text NOT NULL,
	"from_me" boolean DEFAULT false NOT NULL,
	"body" text,
	"type" text,
	"media_id" text,
	"mimetype" text,
	"filename" text,
	"filesize" integer,
	"received_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_reads_conversation_user_idx" ON "conversation_reads" ("conversation_id","user_id");--> statement-breakpoint
CREATE INDEX "conversation_reads_user_idx" ON "conversation_reads" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_wa_account_chat_idx" ON "conversations" ("wa_account_id","chat_id") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE INDEX "conversations_wa_account_last_message_idx" ON "conversations" ("wa_account_id","last_message_at");--> statement-breakpoint
CREATE INDEX "conversations_contact_id_idx" ON "conversations" ("contact_id");--> statement-breakpoint
CREATE INDEX "conversations_owner_id_idx" ON "conversations" ("owner_id");--> statement-breakpoint
CREATE INDEX "conversations_status_idx" ON "conversations" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_wa_account_message_id_idx" ON "messages" ("wa_account_id","message_id") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE INDEX "messages_conversation_seq_idx" ON "messages" ("conversation_id","seq");--> statement-breakpoint
CREATE INDEX "messages_wa_account_received_at_idx" ON "messages" ("wa_account_id","received_at");--> statement-breakpoint
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_wa_account_id_wa_accounts_id_fkey" FOREIGN KEY ("wa_account_id") REFERENCES "wa_accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_wa_account_id_wa_accounts_id_fkey" FOREIGN KEY ("wa_account_id") REFERENCES "wa_accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL;
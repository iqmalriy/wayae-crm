ALTER TABLE "customers" ADD COLUMN "created_by_id" text;--> statement-breakpoint
CREATE INDEX "customers_createdById_idx" ON "customers" ("created_by_id");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_id_user_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id");
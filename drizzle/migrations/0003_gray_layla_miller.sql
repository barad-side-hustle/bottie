ALTER TABLE "leads" ADD COLUMN "country" text DEFAULT 'IL' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "leads_country_idx" ON "leads" USING btree ("country");
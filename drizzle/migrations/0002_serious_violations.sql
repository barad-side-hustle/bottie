CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_place_id" text NOT NULL,
	"business_name" text NOT NULL,
	"email" text,
	"website_url" text,
	"google_maps_url" text,
	"address" text,
	"city" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"search_query" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	CONSTRAINT "leads_google_place_id_unique" UNIQUE("google_place_id"),
	CONSTRAINT "leads_status_check" CHECK ("leads"."status" IN ('pending', 'sent', 'failed', 'skipped'))
);
--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "leads_google_place_id_idx" ON "leads" USING btree ("google_place_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "leads_service_role_access" ON "leads" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);
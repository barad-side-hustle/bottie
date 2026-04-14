CREATE TABLE "zoe_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_place_id" text NOT NULL,
	"business_name" text NOT NULL,
	"email" text,
	"website_url" text,
	"google_maps_url" text,
	"address" text,
	"city" text,
	"country" text DEFAULT 'IL' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"search_query" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	CONSTRAINT "zoe_leads_google_place_id_unique" UNIQUE("google_place_id"),
	CONSTRAINT "zoe_leads_status_check" CHECK ("zoe_leads"."status" IN ('pending', 'sent', 'failed', 'skipped'))
);
--> statement-breakpoint
ALTER TABLE "zoe_leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "zoe_leads_google_place_id_idx" ON "zoe_leads" USING btree ("google_place_id");--> statement-breakpoint
CREATE INDEX "zoe_leads_status_idx" ON "zoe_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "zoe_leads_email_idx" ON "zoe_leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "zoe_leads_created_at_idx" ON "zoe_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "zoe_leads_country_idx" ON "zoe_leads" USING btree ("country");--> statement-breakpoint
CREATE POLICY "zoe_leads_service_role_access" ON "zoe_leads" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);
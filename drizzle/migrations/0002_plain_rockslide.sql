CREATE TABLE "location_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"location_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"polar_subscription_id" text,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "location_subscriptions_user_location_unique" UNIQUE("user_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "location_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "subscriptions_service_role_access" ON "subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE "subscriptions" CASCADE;--> statement-breakpoint
ALTER TABLE "location_subscriptions" ADD CONSTRAINT "location_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_subscriptions" ADD CONSTRAINT "location_subscriptions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "location_subscriptions_user_id_idx" ON "location_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "location_subscriptions_location_id_idx" ON "location_subscriptions" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_subscriptions_status_idx" ON "location_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE POLICY "location_subscriptions_service_role_access" ON "location_subscriptions" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);
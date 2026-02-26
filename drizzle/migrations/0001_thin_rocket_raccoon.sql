CREATE TABLE "location_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"location_id" uuid NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"invited_by" text,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "location_members_user_location_unique" UNIQUE("user_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "location_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" text NOT NULL,
	"location_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "location_access_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"invited_by" text NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "location_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "location_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "location_members" ADD CONSTRAINT "location_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_members" ADD CONSTRAINT "location_members_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_members" ADD CONSTRAINT "location_members_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_access_requests" ADD CONSTRAINT "location_access_requests_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_access_requests" ADD CONSTRAINT "location_access_requests_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_access_requests" ADD CONSTRAINT "location_access_requests_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_invitations" ADD CONSTRAINT "location_invitations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_invitations" ADD CONSTRAINT "location_invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "location_members_user_id_idx" ON "location_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "location_members_location_id_idx" ON "location_members" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_access_requests_requester_id_idx" ON "location_access_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "location_access_requests_location_id_idx" ON "location_access_requests" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_access_requests_status_idx" ON "location_access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "location_invitations_location_id_idx" ON "location_invitations" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_invitations_token_idx" ON "location_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "location_invitations_status_idx" ON "location_invitations" USING btree ("status");--> statement-breakpoint
CREATE POLICY "location_members_service_role_access" ON "location_members" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_access_requests_service_role_access" ON "location_access_requests" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_invitations_service_role_access" ON "location_invitations" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email_on_new_review" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "google_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"account_name" text NOT NULL,
	"google_account_name" text,
	"google_refresh_token" text NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "google_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"user_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_accounts_user_id_account_id_pk" PRIMARY KEY("user_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "user_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_location_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"phone_number" text,
	"website_url" text,
	"maps_url" text,
	"review_url" text,
	"description" text,
	"photo_url" text,
	"tone_of_voice" text DEFAULT 'friendly' NOT NULL,
	"language_mode" text DEFAULT 'auto-detect' NOT NULL,
	"max_sentences" integer,
	"allowed_emojis" jsonb,
	"signature" text,
	"star_configs" jsonb NOT NULL,
	"qr_code_settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "locations_google_location_id_unique" UNIQUE("google_location_id")
);
--> statement-breakpoint
ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "account_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"google_business_id" text NOT NULL,
	"connected" boolean DEFAULT true NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_locations_account_location_unique" UNIQUE("account_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "account_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"google_review_id" text NOT NULL,
	"google_review_name" text,
	"name" text NOT NULL,
	"photo_url" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"rating" integer NOT NULL,
	"text" text,
	"date" timestamp with time zone NOT NULL,
	"reply_status" text DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"consumes_quota" boolean DEFAULT true NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"update_time" timestamp with time zone,
	"classifications" jsonb,
	"notification_sent" boolean DEFAULT false NOT NULL,
	CONSTRAINT "reviews_google_review_id_unique" UNIQUE("google_review_id"),
	CONSTRAINT "reviews_reply_status_check" CHECK ("reviews"."reply_status" IN ('pending', 'posted', 'failed')),
	CONSTRAINT "reviews_failure_reason_check" CHECK ("reviews"."failure_reason" IS NULL OR "reviews"."failure_reason" IN ('generation', 'posting', 'quota'))
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "review_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"text" text NOT NULL,
	"status" text NOT NULL,
	"type" text DEFAULT 'ai_generated' NOT NULL,
	"feedback" text,
	"feedback_comment" text,
	"generated_by" text,
	"posted_by" text,
	"posted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "review_responses_status_check" CHECK ("review_responses"."status" IN ('draft', 'posted', 'rejected')),
	CONSTRAINT "review_responses_feedback_check" CHECK ("review_responses"."feedback" IS NULL OR "review_responses"."feedback" IN ('liked', 'disliked'))
);
--> statement-breakpoint
ALTER TABLE "review_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_account_id_google_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."google_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_subscriptions" ADD CONSTRAINT "location_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_subscriptions" ADD CONSTRAINT "location_subscriptions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_locations" ADD CONSTRAINT "account_locations_account_id_google_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."google_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_locations" ADD CONSTRAINT "account_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_account_id_google_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."google_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_generated_by_user_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_posted_by_user_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_members" ADD CONSTRAINT "location_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_members" ADD CONSTRAINT "location_members_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_members" ADD CONSTRAINT "location_members_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_access_requests" ADD CONSTRAINT "location_access_requests_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_access_requests" ADD CONSTRAINT "location_access_requests_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_access_requests" ADD CONSTRAINT "location_access_requests_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_invitations" ADD CONSTRAINT "location_invitations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_invitations" ADD CONSTRAINT "location_invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "google_accounts_email_idx" ON "google_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "google_accounts_connected_at_idx" ON "google_accounts" USING btree ("connected_at");--> statement-breakpoint
CREATE INDEX "user_accounts_user_id_idx" ON "user_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_accounts_account_id_idx" ON "user_accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "location_subscriptions_user_id_idx" ON "location_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "location_subscriptions_location_id_idx" ON "location_subscriptions" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_subscriptions_status_idx" ON "location_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "locations_google_location_id_idx" ON "locations" USING btree ("google_location_id");--> statement-breakpoint
CREATE INDEX "account_locations_account_id_idx" ON "account_locations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "account_locations_location_id_idx" ON "account_locations" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "account_locations_connected_idx" ON "account_locations" USING btree ("connected");--> statement-breakpoint
CREATE INDEX "account_locations_google_business_id_idx" ON "account_locations" USING btree ("google_business_id");--> statement-breakpoint
CREATE INDEX "reviews_location_id_idx" ON "reviews" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "reviews_google_review_id_idx" ON "reviews" USING btree ("google_review_id");--> statement-breakpoint
CREATE INDEX "reviews_reply_status_idx" ON "reviews" USING btree ("reply_status");--> statement-breakpoint
CREATE INDEX "reviews_received_at_idx" ON "reviews" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "reviews_location_status_idx" ON "reviews" USING btree ("location_id","reply_status");--> statement-breakpoint
CREATE INDEX "reviews_received_status_idx" ON "reviews" USING btree ("received_at","reply_status");--> statement-breakpoint
CREATE INDEX "reviews_location_date_idx" ON "reviews" USING btree ("location_id","date");--> statement-breakpoint
CREATE INDEX "reviews_consumes_quota_received_at_idx" ON "reviews" USING btree ("consumes_quota","received_at");--> statement-breakpoint
CREATE INDEX "reviews_location_rating_idx" ON "reviews" USING btree ("location_id","rating");--> statement-breakpoint
CREATE INDEX "reviews_notification_sent_idx" ON "reviews" USING btree ("notification_sent","reply_status");--> statement-breakpoint
CREATE INDEX "review_responses_location_id_idx" ON "review_responses" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "review_responses_review_id_idx" ON "review_responses" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_responses_status_idx" ON "review_responses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_responses_created_at_idx" ON "review_responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_responses_location_status_created_idx" ON "review_responses" USING btree ("location_id","status","created_at");--> statement-breakpoint
CREATE INDEX "review_responses_location_feedback_created_idx" ON "review_responses" USING btree ("location_id","feedback","created_at");--> statement-breakpoint
CREATE INDEX "location_members_user_id_idx" ON "location_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "location_members_location_id_idx" ON "location_members" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_access_requests_requester_id_idx" ON "location_access_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "location_access_requests_location_id_idx" ON "location_access_requests" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_access_requests_status_idx" ON "location_access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "location_invitations_location_id_idx" ON "location_invitations" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_invitations_token_idx" ON "location_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "location_invitations_status_idx" ON "location_invitations" USING btree ("status");--> statement-breakpoint
CREATE POLICY "account_service_role_access" ON "account" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "session_service_role_access" ON "session" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "user_service_role_access" ON "user" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "verification_service_role_access" ON "verification" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "google_accounts_service_role_access" ON "google_accounts" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "user_accounts_service_role_access" ON "user_accounts" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_subscriptions_service_role_access" ON "location_subscriptions" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "locations_service_role_access" ON "locations" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "account_locations_service_role_access" ON "account_locations" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "reviews_service_role_access" ON "reviews" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "review_responses_service_role_access" ON "review_responses" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_members_service_role_access" ON "location_members" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_access_requests_service_role_access" ON "location_access_requests" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_invitations_service_role_access" ON "location_invitations" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);
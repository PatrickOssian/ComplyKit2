CREATE TABLE "activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"ref" text NOT NULL,
	"area" text NOT NULL,
	"action" text NOT NULL,
	"desc" text NOT NULL,
	"deliverable" text NOT NULL,
	"owner" text NOT NULL,
	"priority" text NOT NULL,
	"effort" text NOT NULL,
	"phase" text NOT NULL,
	"cadence" text NOT NULL,
	"deps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"policy_ref" text NOT NULL,
	"standards" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"frameworks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gxp" boolean DEFAULT false NOT NULL,
	"target" text NOT NULL,
	"status" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"evidence" jsonb,
	CONSTRAINT "activities_tenant_id_ref_unique" UNIQUE("tenant_id","ref")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"time" text NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"ip" text NOT NULL,
	"hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"num" integer NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"owner" text NOT NULL,
	"approver" text NOT NULL,
	"policy_ref" text NOT NULL,
	"review" text NOT NULL,
	"version" text NOT NULL,
	"doc_stage" text NOT NULL,
	"gxp" boolean DEFAULT false NOT NULL,
	"frameworks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"effective" text DEFAULT '' NOT NULL,
	"repo" text DEFAULT '' NOT NULL,
	"stages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body" text DEFAULT '',
	"review_sig" jsonb,
	"approve_sig" jsonb,
	CONSTRAINT "documents_tenant_id_num_unique" UNIQUE("tenant_id","num")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"date" text NOT NULL,
	"amount" text NOT NULL,
	"plan" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"sso" boolean DEFAULT false NOT NULL,
	"status" text NOT NULL,
	"last" text DEFAULT '' NOT NULL,
	"init" text NOT NULL,
	"you" boolean DEFAULT false NOT NULL,
	"advisor" boolean DEFAULT false NOT NULL,
	CONSTRAINT "members_tenant_id_email_unique" UNIQUE("tenant_id","email")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"user_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"role" text NOT NULL,
	"advisor_mode" boolean DEFAULT false NOT NULL,
	CONSTRAINT "memberships_user_id_tenant_id_pk" PRIMARY KEY("user_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "pending_signatures" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pending_signatures_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"public_id" text NOT NULL,
	"doc" text NOT NULL,
	"version" text NOT NULL,
	"role" text NOT NULL,
	"requested" text NOT NULL,
	"due" text NOT NULL,
	"gxp" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pending_signatures_tenant_id_public_id_unique" UNIQUE("tenant_id","public_id")
);
--> statement-breakpoint
CREATE TABLE "policy_sections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "policy_sections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"num" integer NOT NULL,
	"title" text NOT NULL,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gxp" boolean DEFAULT false NOT NULL,
	"custom" boolean DEFAULT false NOT NULL,
	CONSTRAINT "policy_sections_tenant_id_num_unique" UNIQUE("tenant_id","num")
);
--> statement-breakpoint
CREATE TABLE "policy_state" (
	"tenant_id" text PRIMARY KEY NOT NULL,
	"stage" text NOT NULL,
	"version" text NOT NULL,
	"published_version" text,
	"valid_from" text,
	"owner" text NOT NULL,
	"review_sig" jsonb,
	"approve_sig" jsonb,
	"bump_kind" text DEFAULT 'minor' NOT NULL,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_controls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recurring_controls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"control" text NOT NULL,
	"cadence" text NOT NULL,
	"owner" text NOT NULL,
	"policy_ref" text NOT NULL,
	"next" text NOT NULL,
	"last_done" text,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"form" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "recurring_controls_tenant_id_control_unique" UNIQUE("tenant_id","control")
);
--> statement-breakpoint
CREATE TABLE "signed_records" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "signed_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tenant_id" text NOT NULL,
	"doc" text NOT NULL,
	"version" text NOT NULL,
	"meaning" text NOT NULL,
	"when" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"tenant_id" text PRIMARY KEY NOT NULL,
	"est_date_override" text,
	"billing_plan_key" text DEFAULT 'compliance' NOT NULL,
	"adv_notes" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short" text NOT NULL,
	"sector" text NOT NULL,
	"role" text NOT NULL,
	"plan" text NOT NULL,
	"users" integer DEFAULT 0 NOT NULL,
	"gxp" boolean DEFAULT false NOT NULL,
	"tint" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_signatures" ADD CONSTRAINT "pending_signatures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_sections" ADD CONSTRAINT "policy_sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_state" ADD CONSTRAINT "policy_state_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_controls" ADD CONSTRAINT "recurring_controls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signed_records" ADD CONSTRAINT "signed_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
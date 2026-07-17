// Drizzle schema for ComplyKit v2's Neon Postgres backend.
//
// Each top-level domain entity from src/lib/data/types.ts gets its own
// table, scoped by tenant_id. Nested/variable-shape substructures that are
// always read/written as a whole (tags, evidence links, document stages,
// e-signatures, recurring-control form/history) stay JSONB rather than
// being fully normalized — this mirrors the shape of the original
// in-memory TenantBucket closely enough that store.ts's exported function
// signatures don't need to change, only their internals.
//
// Better Auth's own tables (user/session/account/verification) are
// appended below the app tables — generated via `npx @better-auth/cli
// generate` and merged in, so their shape matches what Better Auth expects
// exactly rather than being hand-guessed.

import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  sector: text("sector").notNull(),
  role: text("role").notNull(),
  plan: text("plan").notNull(),
  users: integer("users").notNull().default(0),
  gxp: boolean("gxp").notNull().default(false),
  tint: text("tint").notNull(),
  /** pending_approval | active | archived | rejected — see v2.1 addendum. */
  status: text("status").notNull().default("active"),
  requestedBy: text("requested_by").references(() => user.id, { onDelete: "set null" }),
  approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
  rejectedBy: text("rejected_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  /** Informational only at this stage — captured at request time, shown on
   * the request/detail view, not wired into any filtering (no per-tenant
   * "standards in scope" concept exists elsewhere in the app yet). */
  standardsInScope: jsonb("standards_in_scope").notNull().default([]),
  requestNotes: text("request_notes"),
  /** Proposed first-admin email, collected optionally at request time and
   * editable by Platform Admin at approval — approval is blocked until
   * this is set. Only used to pre-fill the TenantInvite created on
   * approval; not itself an invite. */
  requestedAdminEmail: text("requested_admin_email"),
});

export const tenantSettings = pgTable("tenant_settings", {
  tenantId: text("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  estDateOverride: text("est_date_override"),
  billingPlanKey: text("billing_plan_key").notNull().default("compliance"),
  advNotes: jsonb("adv_notes").notNull().default({}),
  /** Workspace nav keys (matches NavDef.v, e.g. "roadmap", "standards") an
   * Admin has hidden from the side rail for this tenant. Cosmetic only —
   * hides the nav link, doesn't block direct navigation to the route. */
  hiddenNav: jsonb("hidden_nav").notNull().default([]),
});

export const activities = pgTable(
  "activities",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ref: text("ref").notNull(),
    area: text("area").notNull(),
    action: text("action").notNull(),
    desc: text("desc").notNull(),
    deliverable: text("deliverable").notNull(),
    owner: text("owner").notNull(),
    priority: text("priority").notNull(),
    effort: text("effort").notNull(),
    phase: text("phase").notNull(),
    cadence: text("cadence").notNull(),
    deps: jsonb("deps").notNull().default([]),
    policyRef: text("policy_ref").notNull(),
    standards: text("standards").notNull(),
    tags: jsonb("tags").notNull().default([]),
    frameworks: jsonb("frameworks").notNull().default([]),
    gxp: boolean("gxp").notNull().default(false),
    target: text("target").notNull(),
    status: text("status").notNull(),
    notes: text("notes").notNull().default(""),
    evidence: jsonb("evidence"),
  },
  (t) => [unique().on(t.tenantId, t.ref)],
);

export const documents = pgTable(
  "documents",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    num: integer("num").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    owner: text("owner").notNull(),
    approver: text("approver").notNull(),
    policyRef: text("policy_ref").notNull(),
    review: text("review").notNull(),
    version: text("version").notNull(),
    docStage: text("doc_stage").notNull(),
    gxp: boolean("gxp").notNull().default(false),
    frameworks: jsonb("frameworks").notNull().default([]),
    effective: text("effective").notNull().default(""),
    repo: text("repo").notNull().default(""),
    stages: jsonb("stages").notNull().default([]),
    body: text("body").default(""),
    reviewSig: jsonb("review_sig"),
    approveSig: jsonb("approve_sig"),
  },
  (t) => [unique().on(t.tenantId, t.num)],
);

export const policySections = pgTable(
  "policy_sections",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    num: integer("num").notNull(),
    title: text("title").notNull(),
    body: jsonb("body").notNull().default([]),
    gxp: boolean("gxp").notNull().default(false),
    custom: boolean("custom").notNull().default(false),
  },
  (t) => [unique().on(t.tenantId, t.num)],
);

export const policyState = pgTable("policy_state", {
  tenantId: text("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  version: text("version").notNull(),
  publishedVersion: text("published_version"),
  validFrom: text("valid_from"),
  owner: text("owner").notNull(),
  reviewSig: jsonb("review_sig"),
  approveSig: jsonb("approve_sig"),
  bumpKind: text("bump_kind").notNull().default("minor"),
  history: jsonb("history").notNull().default([]),
});

export const recurringControls = pgTable(
  "recurring_controls",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    control: text("control").notNull(),
    cadence: text("cadence").notNull(),
    owner: text("owner").notNull(),
    policyRef: text("policy_ref").notNull(),
    next: text("next").notNull(),
    lastDone: text("last_done"),
    history: jsonb("history").notNull().default([]),
    form: jsonb("form").notNull().default({}),
  },
  (t) => [unique().on(t.tenantId, t.control)],
);

export const members = pgTable(
  "members",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull(),
    sso: boolean("sso").notNull().default(false),
    status: text("status").notNull(),
    last: text("last").notNull().default(""),
    init: text("init").notNull(),
    you: boolean("you").notNull().default(false),
    advisor: boolean("advisor").notNull().default(false),
  },
  (t) => [unique().on(t.tenantId, t.email)],
);

export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  amount: text("amount").notNull(),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  time: text("time").notNull(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  ip: text("ip").notNull(),
  hash: text("hash").notNull(),
});

export const pendingSignatures = pgTable(
  "pending_signatures",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    doc: text("doc").notNull(),
    version: text("version").notNull(),
    role: text("role").notNull(),
    requested: text("requested").notNull(),
    due: text("due").notNull(),
    gxp: boolean("gxp").notNull().default(false),
  },
  (t) => [unique().on(t.tenantId, t.publicId)],
);

export const signedRecords = pgTable("signed_records", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  doc: text("doc").notNull(),
  version: text("version").notNull(),
  meaning: text("meaning").notNull(),
  when: text("when").notNull(),
});

// App-level membership (which real user has which role at which tenant),
// distinct from Better Auth's own session/account tables below and from
// the cosmetic per-tenant `members` roster table above.
export const memberships = pgTable(
  "memberships",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    advisorMode: boolean("advisor_mode").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.tenantId] })],
);

// ---- v2.1: tenant provisioning & platform admin ----

// Global, tenant-independent identity flags — deliberately separate from
// Better Auth's own `user` table (that file is CLI-generated/owned, not
// meant for hand edits) and from the per-tenant `memberships` table (an
// advisor needs to be identifiable as "an advisor" before any tenant they'd
// be a member of even exists, e.g. while submitting a brand-new tenant
// request — memberships can't express that, there's nothing to attach to).
export const platformAccess = pgTable("platform_access", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
  isAdvisor: boolean("is_advisor").notNull().default(false),
});

export const tenantInvites = pgTable("tenant_invites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  token: text("token").notNull().unique(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("Admin"),
  /** pending | accepted | expired */
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
});

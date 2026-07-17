// Neon Postgres-backed data store, one tenant per set of rows scoped by
// tenant_id. Replaces the earlier in-memory Map-based mock — every
// exported function keeps its original name/signature (now async) so
// callers in actions.ts and app-context.ts only needed `await` added,
// not a rewrite. Uses the stateless Neon HTTP driver (getDb() creates a
// fresh client per call) rather than a module-level singleton, per the
// Cloudflare Workers "no global DB client" constraint.

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import * as schema from "../db/schema";
import type {
  Activity,
  ActivityStatus,
  AuditEvent,
  ControlledDocument,
  Effort,
  EvidenceLink,
  Invoice,
  Member,
  PendingSignature,
  Phase,
  PolicySection,
  PolicyStage,
  Priority,
  RecurringControl,
  RoleName,
  SignedRecord,
  Tenant,
  TenantStatus,
} from "./types";
import { auditStamp, bumpVersion, formatDkDate, formatDkDateTime, nextDueFromCadence, rndHash } from "../domain";

export interface PolicySignature {
  name: string;
  when: string;
}

export interface PolicyHistoryEntry {
  version: string;
  validFrom: string;
  approvedBy: string;
  when: string;
}

export interface PolicyState {
  stage: PolicyStage;
  version: string;
  publishedVersion: string | null;
  validFrom: string | null;
  owner: string;
  reviewSig: PolicySignature | null;
  approveSig: PolicySignature | null;
  bumpKind: "minor" | "major";
  history: PolicyHistoryEntry[];
}

export interface TenantBucket {
  activities: Activity[];
  documents: ControlledDocument[];
  policySections: PolicySection[];
  /** Kept for shape compatibility with callers — sections are now stored
   * as real rows (with their own `custom` flag) in `policySections`
   * directly, so this is always empty. */
  policyCustomSections: PolicySection[];
  /** Kept for shape compatibility — edits are written straight to the
   * section row now, so lookups against this always miss and callers
   * fall back to the (already current) section body/title. */
  policyEdits: Record<number, string>;
  policyTitleEdits: Record<number, string>;
  policyState: PolicyState;
  recurringControls: RecurringControl[];
  members: Member[];
  invoices: Invoice[];
  auditLog: AuditEvent[];
  pendingSignatures: PendingSignature[];
  signedRecords: SignedRecord[];
  estDateOverride: string | null;
  advNotes: Record<string, string>;
  plan: "essentials" | "compliance" | "gxp";
  /** Workspace nav keys (NavDef.v) an Admin has hidden from the side rail. */
  hiddenNavSections: string[];
}

export interface Membership {
  role: RoleName;
  advisorMode: boolean;
}

// ---- row → domain-type mapping ----

function mapActivity(r: typeof schema.activities.$inferSelect): Activity {
  return {
    ref: r.ref,
    area: r.area,
    action: r.action,
    desc: r.desc,
    deliverable: r.deliverable,
    owner: r.owner,
    priority: r.priority as Priority,
    effort: r.effort as Effort,
    phase: r.phase as Phase,
    cadence: r.cadence,
    deps: (r.deps as string[]) ?? [],
    policyRef: r.policyRef,
    standards: r.standards,
    tags: (r.tags as Activity["tags"]) ?? [],
    frameworks: (r.frameworks as string[]) ?? [],
    gxp: r.gxp,
    target: r.target,
    status: r.status as ActivityStatus,
    notes: r.notes,
    evidence: (r.evidence as EvidenceLink[] | null) ?? undefined,
  };
}

function mapDocument(r: typeof schema.documents.$inferSelect): ControlledDocument {
  return {
    num: r.num,
    title: r.title,
    type: r.type as ControlledDocument["type"],
    owner: r.owner,
    approver: r.approver,
    policyRef: r.policyRef,
    review: r.review,
    version: r.version,
    docStage: r.docStage as ControlledDocument["docStage"],
    gxp: r.gxp,
    frameworks: (r.frameworks as string[]) ?? [],
    effective: r.effective,
    repo: r.repo,
    stages: (r.stages as ControlledDocument["stages"]) ?? [],
    body: r.body ?? "",
    reviewSig: (r.reviewSig as ControlledDocument["reviewSig"]) ?? null,
    approveSig: (r.approveSig as ControlledDocument["approveSig"]) ?? null,
  };
}

function mapPolicySection(r: typeof schema.policySections.$inferSelect): PolicySection {
  return {
    num: r.num,
    title: r.title,
    body: (r.body as string[]) ?? [],
    gxp: r.gxp,
    custom: r.custom,
  };
}

function mapRecurringControl(r: typeof schema.recurringControls.$inferSelect): RecurringControl {
  return {
    control: r.control,
    cadence: r.cadence,
    owner: r.owner,
    policyRef: r.policyRef,
    next: r.next,
    lastDone: r.lastDone,
    history: (r.history as RecurringControl["history"]) ?? [],
    form: (r.form as Record<string, unknown>) ?? {},
  };
}

function mapMember(r: typeof schema.members.$inferSelect): Member {
  return {
    name: r.name,
    email: r.email,
    role: r.role as RoleName,
    sso: r.sso,
    status: r.status as Member["status"],
    last: r.last,
    init: r.init,
    you: r.you,
    advisor: r.advisor,
  };
}

function mapInvoice(r: typeof schema.invoices.$inferSelect): Invoice {
  return { date: r.date, amount: r.amount, plan: r.plan, status: r.status as Invoice["status"] };
}

function mapAuditEvent(r: typeof schema.auditLog.$inferSelect): AuditEvent {
  return { time: r.time, actor: r.actor, action: r.action, target: r.target, ip: r.ip, hash: r.hash };
}

function mapPendingSignature(r: typeof schema.pendingSignatures.$inferSelect): PendingSignature {
  return {
    id: r.publicId,
    doc: r.doc,
    version: r.version,
    role: r.role as PendingSignature["role"],
    requested: r.requested,
    due: r.due,
    gxp: r.gxp,
  };
}

function mapSignedRecord(r: typeof schema.signedRecords.$inferSelect): SignedRecord {
  return { doc: r.doc, version: r.version, meaning: r.meaning, when: r.when };
}

function mapPolicyState(r: typeof schema.policyState.$inferSelect): PolicyState {
  return {
    stage: r.stage as PolicyStage,
    version: r.version,
    publishedVersion: r.publishedVersion,
    validFrom: r.validFrom,
    owner: r.owner,
    reviewSig: (r.reviewSig as PolicySignature | null) ?? null,
    approveSig: (r.approveSig as PolicySignature | null) ?? null,
    bumpKind: r.bumpKind as "minor" | "major",
    history: (r.history as PolicyHistoryEntry[]) ?? [],
  };
}

// ---- reads ----

function mapTenant(r: typeof schema.tenants.$inferSelect): Tenant {
  return {
    id: r.id,
    name: r.name,
    short: r.short,
    sector: r.sector,
    role: r.role as RoleName,
    plan: r.plan,
    users: r.users,
    gxp: r.gxp,
    tint: r.tint,
    status: r.status as TenantStatus,
    requestedBy: r.requestedBy,
    approvedBy: r.approvedBy,
    rejectedBy: r.rejectedBy,
    createdAt: r.createdAt.toISOString(),
    approvedAt: r.approvedAt?.toISOString() ?? null,
    rejectedAt: r.rejectedAt?.toISOString() ?? null,
    rejectionReason: r.rejectionReason,
    standardsInScope: (r.standardsInScope as string[]) ?? [],
    requestNotes: r.requestNotes,
  };
}

export async function getTenants(): Promise<Tenant[]> {
  const db = getDb();
  const rows = await db.select().from(schema.tenants);
  return rows.map(mapTenant);
}

export async function getTenant(tenantId: string): Promise<Tenant | undefined> {
  const db = getDb();
  const rows = await db.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId));
  return rows[0] ? mapTenant(rows[0]) : undefined;
}

export async function getMembership(userId: string, tenantId: string): Promise<Membership | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.memberships)
    .where(and(eq(schema.memberships.userId, userId), eq(schema.memberships.tenantId, tenantId)));
  const m = rows[0];
  if (!m) return undefined;
  return { role: m.role as RoleName, advisorMode: m.advisorMode };
}

export async function getBucket(tenantId: string): Promise<TenantBucket> {
  const db = getDb();
  const [settingsRows, activityRows, documentRows, policyRows, policyStateRows, recurringRows, memberRows, invoiceRows, auditRows, pendingRows, signedRows] =
    await Promise.all([
      db.select().from(schema.tenantSettings).where(eq(schema.tenantSettings.tenantId, tenantId)),
      db.select().from(schema.activities).where(eq(schema.activities.tenantId, tenantId)).orderBy(asc(schema.activities.id)),
      db.select().from(schema.documents).where(eq(schema.documents.tenantId, tenantId)).orderBy(asc(schema.documents.num)),
      db.select().from(schema.policySections).where(eq(schema.policySections.tenantId, tenantId)).orderBy(asc(schema.policySections.num)),
      db.select().from(schema.policyState).where(eq(schema.policyState.tenantId, tenantId)),
      db.select().from(schema.recurringControls).where(eq(schema.recurringControls.tenantId, tenantId)).orderBy(asc(schema.recurringControls.id)),
      db.select().from(schema.members).where(eq(schema.members.tenantId, tenantId)).orderBy(asc(schema.members.id)),
      db.select().from(schema.invoices).where(eq(schema.invoices.tenantId, tenantId)).orderBy(asc(schema.invoices.id)),
      db.select().from(schema.auditLog).where(eq(schema.auditLog.tenantId, tenantId)).orderBy(desc(schema.auditLog.id)),
      db.select().from(schema.pendingSignatures).where(eq(schema.pendingSignatures.tenantId, tenantId)).orderBy(asc(schema.pendingSignatures.id)),
      db.select().from(schema.signedRecords).where(eq(schema.signedRecords.tenantId, tenantId)).orderBy(desc(schema.signedRecords.id)),
    ]);

  const settings = settingsRows[0];
  const policyStateRow = policyStateRows[0];

  return {
    activities: activityRows.map(mapActivity),
    documents: documentRows.map(mapDocument),
    policySections: policyRows.map(mapPolicySection),
    policyCustomSections: [],
    policyEdits: {},
    policyTitleEdits: {},
    policyState: policyStateRow
      ? mapPolicyState(policyStateRow)
      : {
          stage: "Kladde",
          version: "0.2",
          publishedVersion: null,
          validFrom: null,
          owner: "Direktionen",
          reviewSig: null,
          approveSig: null,
          bumpKind: "minor",
          history: [],
        },
    recurringControls: recurringRows.map(mapRecurringControl),
    members: memberRows.map(mapMember),
    invoices: invoiceRows.map(mapInvoice),
    auditLog: auditRows.map(mapAuditEvent),
    pendingSignatures: pendingRows.map(mapPendingSignature),
    signedRecords: signedRows.map(mapSignedRecord),
    estDateOverride: settings?.estDateOverride ?? null,
    advNotes: (settings?.advNotes as Record<string, string>) ?? {},
    plan: (settings?.billingPlanKey as TenantBucket["plan"]) ?? "compliance",
    hiddenNavSections: (settings?.hiddenNav as string[]) ?? [],
  };
}

export async function getAllPolicySections(tenantId: string): Promise<PolicySection[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.policySections)
    .where(eq(schema.policySections.tenantId, tenantId))
    .orderBy(asc(schema.policySections.num));
  return rows.map(mapPolicySection);
}

// ---- writes ----

export async function appendAuditEvent(tenantId: string, event: AuditEvent): Promise<void> {
  const db = getDb();
  await db.insert(schema.auditLog).values({ tenantId, ...event });
}

export async function setEstDateOverride(tenantId: string, value: string | null): Promise<void> {
  const db = getDb();
  await db.update(schema.tenantSettings).set({ estDateOverride: value }).where(eq(schema.tenantSettings.tenantId, tenantId));
}

async function updateActivity(tenantId: string, ref: string, patch: Partial<typeof schema.activities.$inferInsert>): Promise<void> {
  const db = getDb();
  await db
    .update(schema.activities)
    .set(patch)
    .where(and(eq(schema.activities.tenantId, tenantId), eq(schema.activities.ref, ref)));
}

export async function setActivityStatus(tenantId: string, ref: string, status: ActivityStatus): Promise<void> {
  await updateActivity(tenantId, ref, { status });
}

export async function setActivityPriority(tenantId: string, ref: string, priority: Priority): Promise<void> {
  await updateActivity(tenantId, ref, { priority });
}

export async function setActivityPhase(tenantId: string, ref: string, phase: Phase): Promise<void> {
  await updateActivity(tenantId, ref, { phase });
}

export async function setActivityEffort(tenantId: string, ref: string, effort: Effort): Promise<void> {
  await updateActivity(tenantId, ref, { effort });
}

export async function setActivityOwner(tenantId: string, ref: string, owner: string): Promise<void> {
  await updateActivity(tenantId, ref, { owner });
}

export async function setActivityTarget(tenantId: string, ref: string, target: string): Promise<void> {
  await updateActivity(tenantId, ref, { target });
}

export async function addActivityEvidence(tenantId: string, ref: string, evidence: EvidenceLink): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ evidence: schema.activities.evidence })
    .from(schema.activities)
    .where(and(eq(schema.activities.tenantId, tenantId), eq(schema.activities.ref, ref)));
  const current = (rows[0]?.evidence as EvidenceLink[] | null) ?? [];
  await updateActivity(tenantId, ref, { evidence: [...current, evidence] });
}

export async function removeActivityEvidence(tenantId: string, ref: string, index: number): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ evidence: schema.activities.evidence })
    .from(schema.activities)
    .where(and(eq(schema.activities.tenantId, tenantId), eq(schema.activities.ref, ref)));
  const current = (rows[0]?.evidence as EvidenceLink[] | null) ?? [];
  await updateActivity(tenantId, ref, { evidence: current.filter((_, i) => i !== index) });
}

export async function setAdvisorNote(tenantId: string, ref: string, note: string): Promise<void> {
  const db = getDb();
  await db
    .update(schema.tenantSettings)
    .set({ advNotes: sql`${schema.tenantSettings.advNotes} || ${JSON.stringify({ [ref]: note })}::jsonb` })
    .where(eq(schema.tenantSettings.tenantId, tenantId));
}

async function updateDocument(tenantId: string, num: number, patch: Partial<typeof schema.documents.$inferInsert>): Promise<void> {
  const db = getDb();
  await db
    .update(schema.documents)
    .set(patch)
    .where(and(eq(schema.documents.tenantId, tenantId), eq(schema.documents.num, num)));
}

export async function setDocumentTitle(tenantId: string, num: number, title: string): Promise<void> {
  await updateDocument(tenantId, num, { title });
}

export async function setDocumentOwner(tenantId: string, num: number, owner: string): Promise<void> {
  await updateDocument(tenantId, num, { owner });
}

export async function setDocumentApprover(tenantId: string, num: number, approver: string): Promise<void> {
  await updateDocument(tenantId, num, { approver });
}

export async function setDocumentReview(tenantId: string, num: number, review: string): Promise<void> {
  await updateDocument(tenantId, num, { review });
}

export async function setDocumentBody(tenantId: string, num: number, body: string): Promise<void> {
  await updateDocument(tenantId, num, { body });
}

export async function setDocumentStage(tenantId: string, num: number, stage: ControlledDocument["docStage"]): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ effective: schema.documents.effective, repo: schema.documents.repo })
    .from(schema.documents)
    .where(and(eq(schema.documents.tenantId, tenantId), eq(schema.documents.num, num)));
  const cur = rows[0];
  await updateDocument(tenantId, num, {
    docStage: stage,
    effective: stage === "Published" ? cur?.effective || formatDkDate(new Date()) : cur?.effective,
    repo: stage === "Published" ? cur?.repo || "ISMS Library / Procedures" : cur?.repo,
  });
}

export async function sendDocumentToReview(tenantId: string, num: number): Promise<void> {
  await setDocumentStage(tenantId, num, "In review");
}

export async function signDocument(tenantId: string, num: number, kind: "review" | "approve", name: string): Promise<void> {
  const when = formatDkDateTime(new Date());
  if (kind === "review") {
    await updateDocument(tenantId, num, {
      reviewSig: { name, role: "Reviewer", meaning: "Reviewed — checked for accuracy & completeness", when },
    });
  } else {
    await updateDocument(tenantId, num, {
      approveSig: { name, role: "Approver", meaning: "Approved — authorised for release", when },
      docStage: "Approved",
    });
  }
}

export async function publishDocument(tenantId: string, num: number): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ effective: schema.documents.effective, repo: schema.documents.repo })
    .from(schema.documents)
    .where(and(eq(schema.documents.tenantId, tenantId), eq(schema.documents.num, num)));
  const cur = rows[0];
  const today = formatDkDate(new Date());
  await updateDocument(tenantId, num, {
    docStage: "Published",
    version: "1.0",
    effective: cur?.effective || today,
    repo: cur?.repo || "ISMS Library / Procedures",
  });
}

export async function reopenDocument(tenantId: string, num: number): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ version: schema.documents.version })
    .from(schema.documents)
    .where(and(eq(schema.documents.tenantId, tenantId), eq(schema.documents.num, num)));
  const cur = rows[0];
  await updateDocument(tenantId, num, {
    docStage: "Drafting",
    reviewSig: null,
    approveSig: null,
    version: cur ? bumpVersion(cur.version) : "0.1",
  });
}

export async function addDocument(tenantId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ num: schema.documents.num })
    .from(schema.documents)
    .where(eq(schema.documents.tenantId, tenantId));
  const num = rows.length ? Math.max(...rows.map((r) => r.num)) + 1 : 1;
  await db.insert(schema.documents).values({
    tenantId,
    num,
    title: `New controlled document ${num}`,
    type: "Procedure",
    owner: "Information Security Officer",
    approver: "Information Security Officer",
    policyRef: "—",
    review: "Annual (or on change)",
    version: "0.1",
    docStage: "Not started",
    gxp: false,
    frameworks: ["ISO 27001"],
    effective: "",
    repo: "",
    stages: [],
    body: "",
    reviewSig: null,
    approveSig: null,
  });
  return num;
}

export async function setPolicySectionBody(tenantId: string, num: number, text: string): Promise<void> {
  const db = getDb();
  await db
    .update(schema.policySections)
    .set({ body: text.split(/\n{2,}/) })
    .where(and(eq(schema.policySections.tenantId, tenantId), eq(schema.policySections.num, num)));
}

export async function setPolicySectionTitle(tenantId: string, num: number, title: string, _custom: boolean): Promise<void> {
  const db = getDb();
  await db
    .update(schema.policySections)
    .set({ title })
    .where(and(eq(schema.policySections.tenantId, tenantId), eq(schema.policySections.num, num)));
}

export async function addPolicySection(tenantId: string, title: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ num: schema.policySections.num })
    .from(schema.policySections)
    .where(eq(schema.policySections.tenantId, tenantId));
  const num = rows.length ? Math.max(...rows.map((r) => r.num)) + 1 : 1;
  await db.insert(schema.policySections).values({ tenantId, num, title, body: [], gxp: false, custom: true });
  return num;
}

export async function removePolicySection(tenantId: string, num: number): Promise<void> {
  const db = getDb();
  await db
    .delete(schema.policySections)
    .where(and(eq(schema.policySections.tenantId, tenantId), eq(schema.policySections.num, num), eq(schema.policySections.custom, true)));
}

export async function setPolicyOwner(tenantId: string, owner: string): Promise<void> {
  const db = getDb();
  await db.update(schema.policyState).set({ owner }).where(eq(schema.policyState.tenantId, tenantId));
}

export async function setPolicyBumpKind(tenantId: string, bumpKind: "minor" | "major"): Promise<void> {
  const db = getDb();
  await db.update(schema.policyState).set({ bumpKind }).where(eq(schema.policyState.tenantId, tenantId));
}

export async function sendPolicyToReview(tenantId: string): Promise<void> {
  const db = getDb();
  await db.update(schema.policyState).set({ stage: "I review" }).where(eq(schema.policyState.tenantId, tenantId));
}

export async function signPolicy(tenantId: string, kind: "review" | "approve", name: string): Promise<void> {
  const db = getDb();
  const when = formatDkDateTime(new Date());
  if (kind === "review") {
    await db
      .update(schema.policyState)
      .set({ reviewSig: { name, when } })
      .where(eq(schema.policyState.tenantId, tenantId));
  } else {
    await db
      .update(schema.policyState)
      .set({ approveSig: { name, when }, stage: "Godkendt" })
      .where(eq(schema.policyState.tenantId, tenantId));
  }
}

export async function publishPolicy(tenantId: string): Promise<void> {
  const db = getDb();
  const rows = await db.select().from(schema.policyState).where(eq(schema.policyState.tenantId, tenantId));
  const p = rows[0];
  if (!p) return;
  const today = formatDkDate(new Date());
  let version: string;
  if (!p.publishedVersion) {
    version = "1.0";
  } else {
    const [majStr, minStr] = p.publishedVersion.split(".");
    const maj = parseInt(majStr, 10) || 1;
    const min = parseInt(minStr, 10) || 0;
    version = p.bumpKind === "major" ? `${maj + 1}.0` : `${maj}.${min + 1}`;
  }
  const approvedBy = (p.approveSig as PolicySignature | null)?.name ?? "—";
  const history = (p.history as PolicyHistoryEntry[]) ?? [];
  await db
    .update(schema.policyState)
    .set({
      version,
      publishedVersion: version,
      validFrom: today,
      stage: "Publiceret",
      bumpKind: "minor",
      history: [{ version, validFrom: today, approvedBy, when: formatDkDateTime(new Date()) }, ...history],
    })
    .where(eq(schema.policyState.tenantId, tenantId));
}

export async function reopenPolicy(tenantId: string): Promise<void> {
  const db = getDb();
  await db
    .update(schema.policyState)
    .set({ stage: "Kladde", reviewSig: null, approveSig: null })
    .where(eq(schema.policyState.tenantId, tenantId));
}

export async function setRecurringCadence(tenantId: string, control: string, cadence: string): Promise<void> {
  const db = getDb();
  await db
    .update(schema.recurringControls)
    .set({ cadence })
    .where(and(eq(schema.recurringControls.tenantId, tenantId), eq(schema.recurringControls.control, control)));
}

export async function setRecurringFormField(tenantId: string, control: string, key: string, value: unknown): Promise<void> {
  const db = getDb();
  await db
    .update(schema.recurringControls)
    .set({ form: sql`${schema.recurringControls.form} || ${JSON.stringify({ [key]: value })}::jsonb` })
    .where(and(eq(schema.recurringControls.tenantId, tenantId), eq(schema.recurringControls.control, control)));
}

export async function toggleRecurringChecklistItem(tenantId: string, control: string, fieldKey: string, idx: number): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ form: schema.recurringControls.form })
    .from(schema.recurringControls)
    .where(and(eq(schema.recurringControls.tenantId, tenantId), eq(schema.recurringControls.control, control)));
  const form = (rows[0]?.form as Record<string, unknown>) ?? {};
  const cur = { ...((form[fieldKey] as Record<number, boolean>) ?? {}) };
  cur[idx] = !cur[idx];
  await db
    .update(schema.recurringControls)
    .set({ form: { ...form, [fieldKey]: cur } })
    .where(and(eq(schema.recurringControls.tenantId, tenantId), eq(schema.recurringControls.control, control)));
}

export async function completeRecurring(tenantId: string, control: string): Promise<void> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.recurringControls)
    .where(and(eq(schema.recurringControls.tenantId, tenantId), eq(schema.recurringControls.control, control)));
  const r = rows[0];
  const form = (r?.form as Record<string, unknown>) ?? {};
  if (!r || !form.outcome) return;
  const today = formatDkDate(new Date());
  const next = nextDueFromCadence(r.cadence, new Date());
  const history = (r.history as PolicyHistoryEntry[]) ?? [];
  const entry = { when: today, outcome: String(form.outcome), form };
  await db
    .update(schema.recurringControls)
    .set({ lastDone: today, next, history: [entry, ...history] })
    .where(and(eq(schema.recurringControls.tenantId, tenantId), eq(schema.recurringControls.control, control)));
}

function deriveNameAndInitials(email: string): { name: string; init: string } {
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  const words = local.split(" ").filter(Boolean);
  const name = words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || email;
  const init = (words.map((w) => w[0]).join("").slice(0, 2) || email[0]).toUpperCase();
  return { name, init };
}

export async function inviteMember(tenantId: string, actorName: string, email: string, role: RoleName): Promise<void> {
  if (!/.+@.+\..+/.test(email)) return;
  const db = getDb();
  const { name, init } = deriveNameAndInitials(email);
  await db.insert(schema.members).values({ tenantId, name, email, role, sso: false, status: "Invited", last: "—", init });
  await db.insert(schema.auditLog).values({
    tenantId,
    time: auditStamp(new Date()),
    actor: actorName,
    action: "member.invite",
    target: `${email} → ${role}`,
    ip: "62.243.14.7",
    hash: rndHash(),
  });
}

export async function removeMember(tenantId: string, actorName: string, email: string): Promise<void> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.members)
    .where(and(eq(schema.members.tenantId, tenantId), eq(schema.members.email, email)));
  const m = rows[0];
  if (!m || m.you) return;
  await db.delete(schema.members).where(and(eq(schema.members.tenantId, tenantId), eq(schema.members.email, email)));
  await db.insert(schema.auditLog).values({
    tenantId,
    time: auditStamp(new Date()),
    actor: actorName,
    action: "member.remove",
    target: `${email} (${m.role})`,
    ip: "62.243.14.7",
    hash: rndHash(),
  });
}

export async function setMemberRole(tenantId: string, email: string, role: RoleName): Promise<void> {
  const db = getDb();
  await db
    .update(schema.members)
    .set({ role })
    .where(and(eq(schema.members.tenantId, tenantId), eq(schema.members.email, email)));
}

export async function setBillingPlan(tenantId: string, plan: "essentials" | "compliance" | "gxp"): Promise<void> {
  const db = getDb();
  await db.update(schema.tenantSettings).set({ billingPlanKey: plan }).where(eq(schema.tenantSettings.tenantId, tenantId));
}

/** Toggles whether a workspace nav item (NavDef.v, e.g. "roadmap") is hidden
 * from the side rail for this tenant. Cosmetic only — data underneath is
 * never touched, and this doesn't block direct navigation to the route. */
export async function toggleNavSectionHidden(tenantId: string, key: string): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ hiddenNav: schema.tenantSettings.hiddenNav })
    .from(schema.tenantSettings)
    .where(eq(schema.tenantSettings.tenantId, tenantId));
  const current = (rows[0]?.hiddenNav as string[]) ?? [];
  const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
  await db.update(schema.tenantSettings).set({ hiddenNav: next }).where(eq(schema.tenantSettings.tenantId, tenantId));
}

export async function signPendingDocument(tenantId: string, actorName: string, id: string, meaning: string): Promise<void> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.pendingSignatures)
    .where(and(eq(schema.pendingSignatures.tenantId, tenantId), eq(schema.pendingSignatures.publicId, id)));
  const d = rows[0];
  if (!d) return;
  const version = d.version.includes("→") ? d.version.split("→").pop()!.trim() : d.version;
  await db
    .delete(schema.pendingSignatures)
    .where(and(eq(schema.pendingSignatures.tenantId, tenantId), eq(schema.pendingSignatures.publicId, id)));
  await db.insert(schema.signedRecords).values({ tenantId, doc: d.doc, version, meaning, when: "Just now" });
  await db.insert(schema.auditLog).values({
    tenantId,
    time: auditStamp(new Date()),
    actor: actorName,
    action: "esignature.apply",
    target: `${d.doc} ${version}`,
    ip: "62.243.14.7",
    hash: rndHash(),
  });
}

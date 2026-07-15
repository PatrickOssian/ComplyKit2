// In-memory mock data store, one bucket per tenant, lazily cloned from the
// seed data on first access. This resets on dev-server restart / cold
// Worker start — acceptable for this mock-data phase. When Neon is wired
// in later, only the internals of this module change (per-request
// postgres/@neondatabase/serverless client); call sites in Server Actions
// stay the same.

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
  SignedRecord,
  Tenant,
} from "./types";
import {
  activities as seedActivities,
  auditLog as seedAuditLog,
  documents as seedDocuments,
  invoices as seedInvoices,
  members as seedMembers,
  pendingSignatures as seedPendingSignatures,
  policyMeta as seedPolicyMeta,
  policySections as seedPolicySections,
  procedureDrafts,
  recurringControls as seedRecurringControls,
  signedRecords as seedSignedRecords,
  tenants,
} from "./seed";
import { bumpVersion, formatDkDate, formatDkDateTime, nextDueFromCadence } from "../domain";

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
  /** User-added custom policy sections (beyond the 28 seed sections). */
  policyCustomSections: PolicySection[];
  /** Draft body-text overrides per section num, split on blank lines like the seed body[] arrays. */
  policyEdits: Record<number, string>;
  /** Title overrides for built-in (non-custom) policy sections. */
  policyTitleEdits: Record<number, string>;
  policyState: PolicyState;
  recurringControls: RecurringControl[];
  members: Member[];
  invoices: Invoice[];
  auditLog: AuditEvent[];
  pendingSignatures: PendingSignature[];
  signedRecords: SignedRecord[];
  /** Manual override for the dashboard's estimated audit-ready month (e.g. "jul 2026"). */
  estDateOverride: string | null;
  /** Advisor notes on individual action-plan activities, keyed by activity ref. */
  advNotes: Record<string, string>;
}

function seedDocument(doc: ControlledDocument): ControlledDocument {
  const body = procedureDrafts[doc.num as keyof typeof procedureDrafts] ?? "";
  let reviewSig: ControlledDocument["reviewSig"] = null;
  let approveSig: ControlledDocument["approveSig"] = null;
  if (doc.docStage === "Published" || doc.docStage === "Approved") {
    const approverName = doc.approver.includes("Executive")
      ? "J. Mikkelsen (Executive Mgmt)"
      : "M. Krogh (ISO)";
    reviewSig = {
      name: "A. Holm",
      role: "Reviewer",
      meaning: "Reviewed — checked for accuracy & completeness",
      when: "18 aug 2026 10:24",
    };
    approveSig = {
      name: approverName,
      role: "Approver",
      meaning: "Approved — authorised for release",
      when: "22 aug 2026 14:07",
    };
  }
  return { ...doc, body, reviewSig, approveSig };
}

function createBucket(): TenantBucket {
  return {
    activities: seedActivities.map((a) => ({ ...a })),
    documents: seedDocuments.map((d) => seedDocument({ ...d })),
    policySections: seedPolicySections.map((p) => ({ ...p })),
    policyCustomSections: [],
    policyEdits: {},
    policyTitleEdits: {},
    policyState: {
      stage: "Kladde",
      version: seedPolicyMeta.policyVersion || "0.2",
      publishedVersion: null,
      validFrom: null,
      owner: seedPolicyMeta.owner || "Direktionen",
      reviewSig: null,
      approveSig: null,
      bumpKind: "minor",
      history: [],
    },
    recurringControls: seedRecurringControls.map((r) => ({ ...r, history: [], form: {} })),
    members: seedMembers.map((m) => ({ ...m })),
    invoices: seedInvoices.map((i) => ({ ...i })),
    auditLog: seedAuditLog.map((e) => ({ ...e })),
    pendingSignatures: seedPendingSignatures.map((p) => ({ ...p })),
    signedRecords: seedSignedRecords.map((s) => ({ ...s })),
    estDateOverride: null,
    advNotes: {
      "1.1": "Rådgiver (Stage One): Sørg for at udnævnelsen også afspejles i politikkens §4.2 og i organisationsdiagrammet — auditor beder typisk om begge. /MS",
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- module-level singleton
const g = globalThis as any;
const buckets: Map<string, TenantBucket> = g.__complykitBuckets ?? new Map();
g.__complykitBuckets = buckets;

export function getTenants(): Tenant[] {
  return tenants;
}

export function getTenant(tenantId: string): Tenant | undefined {
  return tenants.find((t) => t.id === tenantId);
}

export function getBucket(tenantId: string): TenantBucket {
  let bucket = buckets.get(tenantId);
  if (!bucket) {
    bucket = createBucket();
    buckets.set(tenantId, bucket);
  }
  return bucket;
}

export function appendAuditEvent(tenantId: string, event: AuditEvent): void {
  const bucket = getBucket(tenantId);
  bucket.auditLog = [event, ...bucket.auditLog];
}

export function setEstDateOverride(tenantId: string, value: string | null): void {
  const bucket = getBucket(tenantId);
  bucket.estDateOverride = value;
}

function updateActivity(tenantId: string, ref: string, patch: Partial<Activity>): void {
  const bucket = getBucket(tenantId);
  bucket.activities = bucket.activities.map((a) => (a.ref === ref ? { ...a, ...patch } : a));
}

export function setActivityStatus(tenantId: string, ref: string, status: ActivityStatus): void {
  updateActivity(tenantId, ref, { status });
}

export function setActivityPriority(tenantId: string, ref: string, priority: Priority): void {
  updateActivity(tenantId, ref, { priority });
}

export function setActivityPhase(tenantId: string, ref: string, phase: Phase): void {
  updateActivity(tenantId, ref, { phase });
}

export function setActivityEffort(tenantId: string, ref: string, effort: Effort): void {
  updateActivity(tenantId, ref, { effort });
}

export function setActivityOwner(tenantId: string, ref: string, owner: string): void {
  updateActivity(tenantId, ref, { owner });
}

export function setActivityTarget(tenantId: string, ref: string, target: string): void {
  updateActivity(tenantId, ref, { target });
}

export function addActivityEvidence(tenantId: string, ref: string, evidence: EvidenceLink): void {
  const bucket = getBucket(tenantId);
  bucket.activities = bucket.activities.map((a) =>
    a.ref === ref ? { ...a, evidence: [...(a.evidence ?? []), evidence] } : a,
  );
}

export function removeActivityEvidence(tenantId: string, ref: string, index: number): void {
  const bucket = getBucket(tenantId);
  bucket.activities = bucket.activities.map((a) =>
    a.ref === ref ? { ...a, evidence: (a.evidence ?? []).filter((_, i) => i !== index) } : a,
  );
}

export function setAdvisorNote(tenantId: string, ref: string, note: string): void {
  const bucket = getBucket(tenantId);
  bucket.advNotes = { ...bucket.advNotes, [ref]: note };
}

function updateDocument(tenantId: string, num: number, patch: Partial<ControlledDocument>): void {
  const bucket = getBucket(tenantId);
  bucket.documents = bucket.documents.map((d) => (d.num === num ? { ...d, ...patch } : d));
}

export function setDocumentTitle(tenantId: string, num: number, title: string): void {
  updateDocument(tenantId, num, { title });
}

export function setDocumentOwner(tenantId: string, num: number, owner: string): void {
  updateDocument(tenantId, num, { owner });
}

export function setDocumentApprover(tenantId: string, num: number, approver: string): void {
  updateDocument(tenantId, num, { approver });
}

export function setDocumentReview(tenantId: string, num: number, review: string): void {
  updateDocument(tenantId, num, { review });
}

export function setDocumentBody(tenantId: string, num: number, body: string): void {
  updateDocument(tenantId, num, { body });
}

export function setDocumentStage(tenantId: string, num: number, stage: ControlledDocument["docStage"]): void {
  const bucket = getBucket(tenantId);
  bucket.documents = bucket.documents.map((d) => {
    if (d.num !== num) return d;
    return {
      ...d,
      docStage: stage,
      effective: stage === "Published" ? d.effective || formatDkDate(new Date()) : d.effective,
      repo: stage === "Published" ? d.repo || "ISMS Library / Procedures" : d.repo,
    };
  });
}

export function sendDocumentToReview(tenantId: string, num: number): void {
  setDocumentStage(tenantId, num, "In review");
}

export function signDocument(tenantId: string, num: number, kind: "review" | "approve", name: string): void {
  const bucket = getBucket(tenantId);
  const when = formatDkDateTime(new Date());
  bucket.documents = bucket.documents.map((d) => {
    if (d.num !== num) return d;
    if (kind === "review") {
      return { ...d, reviewSig: { name, role: "Reviewer", meaning: "Reviewed — checked for accuracy & completeness", when } };
    }
    return {
      ...d,
      approveSig: { name, role: "Approver", meaning: "Approved — authorised for release", when },
      docStage: "Approved",
    };
  });
}

export function publishDocument(tenantId: string, num: number): void {
  const bucket = getBucket(tenantId);
  const today = formatDkDate(new Date());
  bucket.documents = bucket.documents.map((d) =>
    d.num === num
      ? { ...d, docStage: "Published", version: "1.0", effective: d.effective || today, repo: d.repo || "ISMS Library / Procedures" }
      : d,
  );
}

export function reopenDocument(tenantId: string, num: number): void {
  const bucket = getBucket(tenantId);
  bucket.documents = bucket.documents.map((d) =>
    d.num === num
      ? { ...d, docStage: "Drafting", reviewSig: null, approveSig: null, version: bumpVersion(d.version) }
      : d,
  );
}

export function addDocument(tenantId: string): number {
  const bucket = getBucket(tenantId);
  const num = bucket.documents.length ? Math.max(...bucket.documents.map((d) => d.num)) + 1 : 1;
  const doc: ControlledDocument = {
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
  };
  bucket.documents = [...bucket.documents, doc];
  return num;
}

export function getAllPolicySections(tenantId: string): PolicySection[] {
  const bucket = getBucket(tenantId);
  return [...bucket.policySections, ...bucket.policyCustomSections];
}

export function setPolicySectionBody(tenantId: string, num: number, text: string): void {
  const bucket = getBucket(tenantId);
  bucket.policyEdits = { ...bucket.policyEdits, [num]: text };
}

export function setPolicySectionTitle(tenantId: string, num: number, title: string, custom: boolean): void {
  const bucket = getBucket(tenantId);
  if (custom) {
    bucket.policyCustomSections = bucket.policyCustomSections.map((s) => (s.num === num ? { ...s, title } : s));
  } else {
    bucket.policyTitleEdits = { ...bucket.policyTitleEdits, [num]: title };
  }
}

export function addPolicySection(tenantId: string, title: string): number {
  const bucket = getBucket(tenantId);
  const nums = [...bucket.policySections, ...bucket.policyCustomSections].map((s) => s.num);
  const num = nums.length ? Math.max(...nums) + 1 : 1;
  bucket.policyCustomSections = [...bucket.policyCustomSections, { num, title, body: [], gxp: false, custom: true }];
  return num;
}

export function removePolicySection(tenantId: string, num: number): void {
  const bucket = getBucket(tenantId);
  bucket.policyCustomSections = bucket.policyCustomSections.filter((s) => s.num !== num);
  const edits = { ...bucket.policyEdits };
  delete edits[num];
  bucket.policyEdits = edits;
}

export function setPolicyOwner(tenantId: string, owner: string): void {
  const bucket = getBucket(tenantId);
  bucket.policyState = { ...bucket.policyState, owner };
}

export function setPolicyBumpKind(tenantId: string, bumpKind: "minor" | "major"): void {
  const bucket = getBucket(tenantId);
  bucket.policyState = { ...bucket.policyState, bumpKind };
}

export function sendPolicyToReview(tenantId: string): void {
  const bucket = getBucket(tenantId);
  bucket.policyState = { ...bucket.policyState, stage: "I review" };
}

export function signPolicy(tenantId: string, kind: "review" | "approve", name: string): void {
  const bucket = getBucket(tenantId);
  const when = formatDkDateTime(new Date());
  if (kind === "review") {
    bucket.policyState = { ...bucket.policyState, reviewSig: { name, when } };
  } else {
    bucket.policyState = { ...bucket.policyState, approveSig: { name, when }, stage: "Godkendt" };
  }
}

export function publishPolicy(tenantId: string): void {
  const bucket = getBucket(tenantId);
  const p = bucket.policyState;
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
  bucket.policyState = {
    ...p,
    version,
    publishedVersion: version,
    validFrom: today,
    stage: "Publiceret",
    bumpKind: "minor",
    history: [
      { version, validFrom: today, approvedBy: p.approveSig?.name ?? "—", when: formatDkDateTime(new Date()) },
      ...p.history,
    ],
  };
}

export function reopenPolicy(tenantId: string): void {
  const bucket = getBucket(tenantId);
  bucket.policyState = { ...bucket.policyState, stage: "Kladde", reviewSig: null, approveSig: null };
}

export function setRecurringCadence(tenantId: string, control: string, cadence: string): void {
  const bucket = getBucket(tenantId);
  bucket.recurringControls = bucket.recurringControls.map((r) => (r.control === control ? { ...r, cadence } : r));
}

export function setRecurringFormField(tenantId: string, control: string, key: string, value: unknown): void {
  const bucket = getBucket(tenantId);
  bucket.recurringControls = bucket.recurringControls.map((r) =>
    r.control === control ? { ...r, form: { ...(r.form ?? {}), [key]: value } } : r,
  );
}

export function toggleRecurringChecklistItem(tenantId: string, control: string, fieldKey: string, idx: number): void {
  const bucket = getBucket(tenantId);
  bucket.recurringControls = bucket.recurringControls.map((r) => {
    if (r.control !== control) return r;
    const cur = { ...((r.form?.[fieldKey] as Record<number, boolean>) ?? {}) };
    cur[idx] = !cur[idx];
    return { ...r, form: { ...(r.form ?? {}), [fieldKey]: cur } };
  });
}

export function completeRecurring(tenantId: string, control: string): void {
  const bucket = getBucket(tenantId);
  const r = bucket.recurringControls.find((x) => x.control === control);
  if (!r || !r.form || !r.form.outcome) return;
  const today = formatDkDate(new Date());
  const next = nextDueFromCadence(r.cadence, new Date());
  const entry = { when: today, outcome: String(r.form.outcome), form: r.form };
  bucket.recurringControls = bucket.recurringControls.map((x) =>
    x.control === control ? { ...x, lastDone: today, next, history: [entry, ...(x.history ?? [])] } : x,
  );
}

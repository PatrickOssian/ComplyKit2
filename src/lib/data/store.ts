// In-memory mock data store, one bucket per tenant, lazily cloned from the
// seed data on first access. This resets on dev-server restart / cold
// Worker start — acceptable for this mock-data phase. When Neon is wired
// in later, only the internals of this module change (per-request
// postgres/@neondatabase/serverless client); call sites in Server Actions
// stay the same.

import type {
  Activity,
  AuditEvent,
  ControlledDocument,
  Invoice,
  Member,
  PendingSignature,
  PolicySection,
  PolicyStage,
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

export interface PolicyState {
  stage: PolicyStage;
  version: string;
  publishedVersion: string | null;
  validFrom: string | null;
  owner: string;
  reviewSig: null | { name: string; role: "Reviewer"; meaning: string; when: string };
  approveSig: null | { name: string; role: "Approver"; meaning: string; when: string };
  bumpKind: "minor" | "major";
}

export interface TenantBucket {
  activities: Activity[];
  documents: ControlledDocument[];
  policySections: PolicySection[];
  policyState: PolicyState;
  recurringControls: RecurringControl[];
  members: Member[];
  invoices: Invoice[];
  auditLog: AuditEvent[];
  pendingSignatures: PendingSignature[];
  signedRecords: SignedRecord[];
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
    policyState: {
      stage: "Kladde",
      version: seedPolicyMeta.policyVersion || "0.2",
      publishedVersion: null,
      validFrom: null,
      owner: seedPolicyMeta.owner || "Direktionen",
      reviewSig: null,
      approveSig: null,
      bumpKind: "minor",
    },
    recurringControls: seedRecurringControls.map((r) => ({ ...r, history: [], form: {} })),
    members: seedMembers.map((m) => ({ ...m })),
    invoices: seedInvoices.map((i) => ({ ...i })),
    auditLog: seedAuditLog.map((e) => ({ ...e })),
    pendingSignatures: seedPendingSignatures.map((p) => ({ ...p })),
    signedRecords: seedSignedRecords.map((s) => ({ ...s })),
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

// Instantiates the standard mock dataset (Appendix A activities, Appendix B
// documents, policy sections, recurring controls, ...) for one tenant.
// Extracted from scripts/seed.ts so the exact same insert sequence can run
// for both the 4 demo tenants (via that script) and a real tenant approved
// through the v2.1 provisioning flow (via platform-actions.ts) — one
// implementation, not two copies that could drift apart.
//
// Deliberately safe to import statically: unlike src/lib/auth.ts (which
// calls getDb() at module top-level, forcing the dynamic-import dance seen
// in scripts/seed.ts), getDb() here is only called inside the function
// body, once actually invoked — by then env vars are already available
// either way (dotenv in the script path, Next.js/Workers bindings in the
// server-action path).

import { getDb } from "../db/client";
import * as schema from "../db/schema";
import {
  activities,
  auditLog,
  documents,
  invoices,
  members,
  pendingSignatures,
  policyMeta,
  policySections,
  procedureDrafts,
  recurringControls,
  signedRecords,
} from "./seed";
import type { ControlledDocument } from "./types";

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

export async function seedTenantData(tenantId: string): Promise<void> {
  const db = getDb();

  await db.insert(schema.tenantSettings).values({
    tenantId,
    estDateOverride: null,
    billingPlanKey: "compliance",
    advNotes: {
      "1.1":
        "Rådgiver (Stage One): Sørg for at udnævnelsen også afspejles i politikkens §4.2 og i organisationsdiagrammet — auditor beder typisk om begge. /MS",
    },
  });

  if (activities.length) {
    await db.insert(schema.activities).values(
      activities.map((a) => ({
        tenantId,
        ref: a.ref,
        area: a.area,
        action: a.action,
        desc: a.desc,
        deliverable: a.deliverable,
        owner: a.owner,
        priority: a.priority,
        effort: a.effort,
        phase: a.phase,
        cadence: a.cadence,
        deps: a.deps,
        policyRef: a.policyRef,
        standards: a.standards,
        tags: a.tags,
        frameworks: a.frameworks,
        gxp: a.gxp,
        target: a.target,
        status: a.status,
        notes: a.notes,
        evidence: a.evidence ?? null,
      })),
    );
  }

  if (documents.length) {
    await db.insert(schema.documents).values(
      documents.map((raw) => {
        const d = seedDocument({ ...raw });
        return {
          tenantId,
          num: d.num,
          title: d.title,
          type: d.type,
          owner: d.owner,
          approver: d.approver,
          policyRef: d.policyRef,
          review: d.review,
          version: d.version,
          docStage: d.docStage,
          gxp: d.gxp,
          frameworks: d.frameworks,
          effective: d.effective,
          repo: d.repo,
          stages: d.stages,
          body: d.body ?? "",
          reviewSig: d.reviewSig ?? null,
          approveSig: d.approveSig ?? null,
        };
      }),
    );
  }

  if (policySections.length) {
    await db.insert(schema.policySections).values(
      policySections.map((p) => ({
        tenantId,
        num: p.num,
        title: p.title,
        body: p.body,
        gxp: p.gxp ?? false,
        custom: p.custom ?? false,
      })),
    );
  }

  await db.insert(schema.policyState).values({
    tenantId,
    stage: "Kladde",
    version: policyMeta.policyVersion || "0.2",
    publishedVersion: null,
    validFrom: null,
    owner: policyMeta.owner || "Direktionen",
    reviewSig: null,
    approveSig: null,
    bumpKind: "minor",
    history: [],
  });

  if (recurringControls.length) {
    await db.insert(schema.recurringControls).values(
      recurringControls.map((r) => ({
        tenantId,
        control: r.control,
        cadence: r.cadence,
        owner: r.owner,
        policyRef: r.policyRef,
        next: r.next,
        lastDone: r.lastDone ?? null,
        history: [],
        form: {},
      })),
    );
  }

  if (members.length) {
    await db.insert(schema.members).values(
      members.map((m) => ({
        tenantId,
        name: m.name,
        email: m.email,
        role: m.role,
        sso: m.sso,
        status: m.status,
        last: m.last,
        init: m.init,
        you: m.you ?? false,
        advisor: m.advisor ?? false,
      })),
    );
  }

  if (invoices.length) {
    await db.insert(schema.invoices).values(invoices.map((i) => ({ tenantId, ...i })));
  }

  if (auditLog.length) {
    await db.insert(schema.auditLog).values(auditLog.map((e) => ({ tenantId, ...e })));
  }

  if (pendingSignatures.length) {
    await db.insert(schema.pendingSignatures).values(
      pendingSignatures.map((p) => ({
        tenantId,
        publicId: p.id,
        doc: p.doc,
        version: p.version,
        role: p.role,
        requested: p.requested,
        due: p.due,
        gxp: p.gxp,
      })),
    );
  }

  if (signedRecords.length) {
    await db.insert(schema.signedRecords).values(signedRecords.map((s) => ({ tenantId, ...s })));
  }
}

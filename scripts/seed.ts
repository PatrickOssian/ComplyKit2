// Populates the (empty) Neon database with the same mock dataset that
// used to live in src/lib/data/store.ts's in-memory buckets — one full
// copy per tenant, matching createBucket()'s previous behaviour of giving
// every tenant an identical seed dataset. Also creates the 5 demo-login
// users (via Better Auth's own signUpEmail, so password hashing matches
// what it expects at login time) and their tenant memberships.
//
// Idempotent: clears the app tables (not the untouched v1-style tables —
// there are none here, this is a dedicated v2 database) before
// re-inserting, so it can be re-run freely during development.
//
// Run with: npx tsx scripts/seed.ts

import { config } from "dotenv";
import type { ControlledDocument } from "../src/lib/data/types";

// dotenv must finish loading .env.local before any module that reads
// process.env.DATABASE_URL at import time (db/client.ts, auth.ts)
// evaluates — dynamic import() defers that evaluation until after this
// runs, unlike a static import which could hoist ahead of it.
config({ path: ".env.local" });

const DEMO_PASSWORD = "complykit123";

function seedDocument(
  doc: ControlledDocument,
  procedureDrafts: Record<number, string>,
): ControlledDocument {
  const body = procedureDrafts[doc.num] ?? "";
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

async function main() {
  const { getDb } = await import("../src/lib/db/client");
  const schema = await import("../src/lib/db/schema");
  const { auth } = await import("../src/lib/auth");
  const {
    activities,
    auditLog,
    demoLogins,
    documents,
    invoices,
    members,
    pendingSignatures,
    policyMeta,
    policySections,
    procedureDrafts,
    recurringControls,
    signedRecords,
    tenants,
  } = await import("../src/lib/data/seed");

  const db = getDb();

  console.log("Clearing existing app data…");
  await db.delete(schema.memberships);
  await db.delete(schema.signedRecords);
  await db.delete(schema.pendingSignatures);
  await db.delete(schema.auditLog);
  await db.delete(schema.invoices);
  await db.delete(schema.members);
  await db.delete(schema.recurringControls);
  await db.delete(schema.policyState);
  await db.delete(schema.policySections);
  await db.delete(schema.documents);
  await db.delete(schema.activities);
  await db.delete(schema.tenantSettings);
  await db.delete(schema.tenants);
  // Better Auth tables — safe to clear here since this seed script is the
  // only writer of demo identities in this fresh database.
  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);

  console.log("Seeding tenants…");
  await db.insert(schema.tenants).values(
    tenants.map((t) => ({
      id: t.id,
      name: t.name,
      short: t.short,
      sector: t.sector,
      role: t.role,
      plan: t.plan,
      users: t.users,
      gxp: t.gxp,
      tint: t.tint,
    })),
  );

  for (const tenant of tenants) {
    const tenantId = tenant.id;
    console.log(`Seeding data for tenant ${tenantId}…`);

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
          const d = seedDocument({ ...raw }, procedureDrafts);
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

  console.log("Creating demo-login users via Better Auth…");
  const roleForDemo: Record<string, { role: string; advisorMode: boolean; name: string; init: string }> = {
    "iso@nordicpharma.demo": { role: "Admin", advisorMode: false, name: "ISO Demo", init: "ID" },
    "editor@nordicpharma.demo": { role: "Editor", advisorMode: false, name: "Editor Demo", init: "ED" },
    "auditor@nordicpharma.demo": { role: "Auditor", advisorMode: false, name: "Auditor Demo", init: "AD" },
    "viewer@nordicpharma.demo": { role: "Viewer", advisorMode: false, name: "Viewer Demo", init: "VD" },
    "advisor@stageone.dk": { role: "Advisor", advisorMode: true, name: "M. Sørensen", init: "MS" },
  };

  for (const login of demoLogins) {
    const meta = roleForDemo[login.email];
    if (!meta) continue;
    const result = await auth.api.signUpEmail({
      body: { email: login.email, password: DEMO_PASSWORD, name: meta.name },
    });
    const userId = result.user.id;
    await db.insert(schema.memberships).values({
      userId,
      tenantId: "np",
      role: meta.role,
      advisorMode: meta.advisorMode,
    });
    console.log(`  ${login.email} → np (${meta.role}${meta.advisorMode ? ", advisor" : ""})`);
  }

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

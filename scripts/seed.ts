// Populates the (empty) Neon database with the same mock dataset that
// used to live in src/lib/data/store.ts's in-memory buckets — one full
// copy per tenant, matching createBucket()'s previous behaviour of giving
// every tenant an identical seed dataset (via seedTenantData(), shared
// with the real tenant-provisioning flow in platform-actions.ts — see
// src/lib/data/seed-tenant.ts). Also creates the 5 demo-login users (via
// Better Auth's own signUpEmail, so password hashing matches what it
// expects at login time), their tenant memberships, and two
// platform_access bootstrap rows for testing the v2.1 provisioning
// module: a Platform-Admin-only placeholder, and isAdvisor=true added to
// the existing advisor demo user.
//
// Idempotent: clears the app tables (not the untouched v1-style tables —
// there are none here, this is a dedicated v2 database) before
// re-inserting, so it can be re-run freely during development.
//
// Run with: npx tsx scripts/seed.ts

import { config } from "dotenv";

// dotenv must finish loading .env.local before any module that reads
// process.env.DATABASE_URL at import time (db/client.ts, auth.ts)
// evaluates — dynamic import() defers that evaluation until after this
// runs, unlike a static import which could hoist ahead of it.
config({ path: ".env.local" });

const DEMO_PASSWORD = "complykit123";
const PLATFORM_ADMIN_EMAIL = "platform-admin@stageone.dk";

async function main() {
  const { getDb } = await import("../src/lib/db/client");
  const schema = await import("../src/lib/db/schema");
  const { auth } = await import("../src/lib/auth");
  const { seedTenantData } = await import("../src/lib/data/seed-tenant");
  const { demoLogins, tenants } = await import("../src/lib/data/seed");

  const db = getDb();

  console.log("Clearing existing app data…");
  await db.delete(schema.tenantInvites);
  await db.delete(schema.platformAccess);
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
    console.log(`Seeding data for tenant ${tenant.id}…`);
    await seedTenantData(tenant.id);
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

    // v2.1 bootstrap: the existing advisor demo user also gets the global
    // isAdvisor flag, so the cross-tenant tenant-request path is testable
    // without a separate account.
    if (login.email === "advisor@stageone.dk") {
      await db.insert(schema.platformAccess).values({ userId, isPlatformAdmin: false, isAdvisor: true });
    }
  }

  console.log("Creating placeholder Platform Admin user…");
  const platformAdmin = await auth.api.signUpEmail({
    body: { email: PLATFORM_ADMIN_EMAIL, password: DEMO_PASSWORD, name: "Platform Admin" },
  });
  await db.insert(schema.platformAccess).values({
    userId: platformAdmin.user.id,
    isPlatformAdmin: true,
    isAdvisor: false,
  });
  console.log(`  ${PLATFORM_ADMIN_EMAIL} → isPlatformAdmin`);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

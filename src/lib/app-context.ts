import { redirect } from "next/navigation";
import { getAuthUser, getWorkspace } from "./session";
import { advisor, disclaimer } from "./data/seed";
import { getBucket, getMembership, getTenant, getTenants } from "./data/store";
import type { RoleName, Tenant } from "./data/types";

export interface AppUser {
  name: string;
  email: string;
  init: string;
  role: RoleName;
}

export interface AppContext {
  session: { tenantId: string; advisorMode: boolean; gxp: boolean };
  tenant: Tenant;
  tenants: Tenant[];
  bucket: Awaited<ReturnType<typeof getBucket>>;
  user: AppUser;
  advisor: typeof advisor;
  disclaimer: string;
}

function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const init = words.map((w) => w[0]).join("").slice(0, 2);
  return (init || name[0] || "?").toUpperCase();
}

/** Loads the current app-shell context for a signed-in page. Redirects to
 * /signin or /workspace if the auth/tenant isn't in a valid state for
 * being inside the app shell — call this at the top of every (app) page. */
export async function requireAppContext(): Promise<AppContext> {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  const workspace = await getWorkspace();
  if (!workspace.tenantId) redirect("/workspace");

  const tenant = await getTenant(workspace.tenantId);
  if (!tenant) redirect("/workspace");

  const membership = await getMembership(authUser.id, workspace.tenantId);
  const role = membership?.role ?? tenant.role;

  return {
    session: { tenantId: workspace.tenantId, advisorMode: workspace.advisorMode, gxp: workspace.gxp },
    tenant,
    tenants: await getTenants(),
    bucket: await getBucket(workspace.tenantId),
    user: { name: authUser.name, email: authUser.email, init: initialsFromName(authUser.name), role },
    advisor,
    disclaimer,
  };
}

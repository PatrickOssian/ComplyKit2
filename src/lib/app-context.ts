import { redirect } from "next/navigation";
import { getSession } from "./session";
import { advisor, currentUser, disclaimer } from "./data/seed";
import { getBucket, getTenant, getTenants } from "./data/store";
import type { Tenant } from "./data/types";

export interface AppContext {
  session: { tenantId: string; advisorMode: boolean; gxp: boolean };
  tenant: Tenant;
  tenants: Tenant[];
  bucket: ReturnType<typeof getBucket>;
  user: typeof currentUser;
  advisor: typeof advisor;
  disclaimer: string;
}

/** Loads the current app-shell context for a signed-in page. Redirects to
 * /signin or /workspace if the session/tenant isn't in a valid state for
 * being inside the app shell — call this at the top of every (app) page. */
export async function requireAppContext(): Promise<AppContext> {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (!session.tenantId) redirect("/workspace");

  const tenant = getTenant(session.tenantId);
  if (!tenant) redirect("/workspace");

  return {
    session: { tenantId: session.tenantId, advisorMode: session.advisorMode, gxp: session.gxp },
    tenant,
    tenants: getTenants(),
    bucket: getBucket(session.tenantId),
    user: currentUser,
    advisor,
    disclaimer,
  };
}

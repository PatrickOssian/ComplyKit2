"use server";

import { redirect } from "next/navigation";
import { getSession, clearSession, setSession } from "./session";

/** Mock sign-in — no real credential check yet, mirrors the design's signIn(). */
export async function signInAction(): Promise<void> {
  await setSession({ tenantId: null, advisorMode: false, gxp: true });
  redirect("/workspace");
}

export async function signOutAction(): Promise<void> {
  await clearSession();
  redirect("/signin");
}

/** Picking a tenant card in the workspace switcher. The "so" pseudo-tenant
 * (Stage One Advisor) drops you into Nordic Pharma's workspace with
 * advisorMode enabled, matching ComplyKit.dc.html's pickTenant(). */
export async function pickTenantAction(tenantId: string): Promise<void> {
  const session = await getSession();
  const advisorMode = tenantId === "so" ? true : session?.advisorMode ?? false;
  const resolvedTenantId = tenantId === "so" ? "np" : tenantId;
  await setSession({
    tenantId: resolvedTenantId,
    advisorMode,
    gxp: session?.gxp ?? true,
  });
  redirect("/dashboard");
}

/** Advisor-only client-site switch from the side-rail dropdown (stays in the app shell). */
export async function pickOrgAction(tenantId: string): Promise<void> {
  const session = await getSession();
  await setSession({
    tenantId,
    advisorMode: session?.advisorMode ?? false,
    gxp: session?.gxp ?? true,
  });
  redirect("/dashboard");
}

export async function switchWorkspaceAction(): Promise<void> {
  const session = await getSession();
  await setSession({ tenantId: null, advisorMode: session?.advisorMode ?? false, gxp: session?.gxp ?? true });
  redirect("/workspace");
}

export async function toggleGxpAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/signin");
  await setSession({ ...session, gxp: !session.gxp });
}

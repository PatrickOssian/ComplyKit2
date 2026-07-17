// Identity/guards for the /platform/* area — mirrors app-context.ts's
// style, but resolves *global* access flags (platform_access) rather than
// a per-tenant role. This is what guarantees a tenant-level
// Admin/Editor/Auditor/Viewer can never reach /platform/*: they simply
// have no platform_access row, full stop, regardless of which tenant
// they belong to. Checked here (the layout guard) AND independently
// inside every platform server action — never trust the layout alone,
// same "cosmetic UI hiding isn't the real gate" principle already
// established for requireCanManageNavSections in actions.ts.

import { redirect } from "next/navigation";
import { getAuthUser } from "./session";
import { getPlatformAccess } from "./data/store";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  isPlatformAdmin: boolean;
  isAdvisor: boolean;
}

export async function requirePlatformUser(): Promise<PlatformUser> {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  const access = await getPlatformAccess(authUser.id);
  if (!access.isPlatformAdmin && !access.isAdvisor) redirect("/workspace");
  return { ...authUser, ...access };
}

/** Bounces an advisor-only user to the one screen they're actually allowed
 * to use, rather than a dead end — never redirects them out of /platform
 * entirely, since they do have legitimate access to part of it. */
export async function requirePlatformAdmin(): Promise<PlatformUser> {
  const platformUser = await requirePlatformUser();
  if (!platformUser.isPlatformAdmin) redirect("/platform/tenants/new");
  return platformUser;
}

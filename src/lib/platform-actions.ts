"use server";

// Server actions for the v2.1 tenant-provisioning module. Deliberately a
// separate file from actions.ts — that file is entirely tenant-workspace
// scoped (requireTenantId() as its first line everywhere); everything
// here is global/cross-tenant, gated by requirePlatformUser/
// requirePlatformAdmin instead.

import { redirect } from "next/navigation";
import { getAuthUser, setWorkspace } from "./session";
import { requirePlatformAdmin, requirePlatformUser } from "./platform-context";
import {
  acceptTenantInvite,
  archiveTenant,
  approveTenantRequest,
  createTenantDirect,
  createTenantInvite,
  createTenantRequest,
  getTenantInvites,
  reassignAdvisor,
  rejectTenantRequest,
  revokeTenantInvite,
} from "./data/store";
import type { TenantApprovalEdits, TenantRequestInput } from "./data/store";
import type { RoleName } from "./data/types";

/** Reachable by both an Advisor and a Platform Admin — the resulting
 * status is decided here from the server-verified isPlatformAdmin flag on
 * the authenticated session, never from any client-supplied input, which
 * is what makes "an advisor can't approve their own request" structural
 * rather than a UI convention. */
export async function submitTenantRequestAction(input: TenantRequestInput): Promise<void> {
  const platformUser = await requirePlatformUser();

  if (platformUser.isPlatformAdmin) {
    if (!input.requestedAdminEmail) {
      throw new Error("En admin-email er nødvendig for at oprette et workspace direkte.");
    }
    const { tenantId } = await createTenantDirect(input, platformUser.id);
    redirect(`/platform/tenants/${tenantId}`);
  }

  const tenantId = await createTenantRequest(input, platformUser.id);
  redirect(`/platform/requests?created=${tenantId}`);
}

export async function approveTenantRequestAction(tenantId: string, edits: TenantApprovalEdits): Promise<void> {
  const platformAdmin = await requirePlatformAdmin();
  await approveTenantRequest(tenantId, edits, platformAdmin.id);
  redirect(`/platform/tenants/${tenantId}`);
}

export async function rejectTenantRequestAction(tenantId: string, reason: string): Promise<void> {
  const platformAdmin = await requirePlatformAdmin();
  await rejectTenantRequest(tenantId, reason.trim() || "No reason given", platformAdmin.id);
  redirect("/platform/requests");
}

export async function archiveTenantAction(tenantId: string): Promise<void> {
  await requirePlatformAdmin();
  await archiveTenant(tenantId);
}

/** "Resend" here means a fresh token + expiry, not literally re-sending an
 * email (there's no email delivery yet — see the v2.1 addendum's decision
 * #4) — so any still-pending invite for the same tenant+email is revoked
 * first to avoid two simultaneously valid links for the same person. */
export async function resendInviteAction(tenantId: string, email: string, role: RoleName): Promise<string> {
  await requirePlatformAdmin();
  const existing = await getTenantInvites(tenantId);
  for (const invite of existing) {
    if (invite.email === email && invite.status === "pending") {
      await revokeTenantInvite(invite.id);
    }
  }
  return createTenantInvite(tenantId, email, role);
}

export async function revokeInviteAction(inviteId: number): Promise<void> {
  await requirePlatformAdmin();
  await revokeTenantInvite(inviteId);
}

export async function reassignAdvisorAction(tenantId: string, advisorUserId: string): Promise<void> {
  await requirePlatformAdmin();
  await reassignAdvisor(tenantId, advisorUserId);
}

/** Paired with /accept-invite/[token]'s client-side authClient.signUp.email()
 * call, the same split already used by the sign-in flow: Better Auth owns
 * credential creation, this does the app-domain bookkeeping (membership
 * row, mark the invite accepted, set the workspace cookie) once the real
 * account already exists. */
export async function acceptInviteBookkeepingAction(token: string): Promise<void> {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  const result = await acceptTenantInvite(token, authUser.id);
  if (!result) {
    throw new Error("Denne invitation er ugyldig eller allerede brugt.");
  }
  await setWorkspace({ tenantId: result.tenantId, advisorMode: false, gxp: true });
  redirect("/dashboard");
}

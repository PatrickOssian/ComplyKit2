"use server";

import { redirect } from "next/navigation";
import { getSession, clearSession, setSession } from "./session";
import {
  addActivityEvidence,
  removeActivityEvidence,
  setActivityEffort,
  setActivityOwner,
  setActivityPhase,
  setActivityPriority,
  setActivityStatus,
  setActivityTarget,
  setAdvisorNote,
  setEstDateOverride,
} from "./data/store";
import { isoDateToDk, monthInputValueToEst, nextStatus, normalizeUrl } from "./domain";
import type { ActivityStatus, Effort, Phase, Priority } from "./data/types";

async function requireTenantId(): Promise<string> {
  const session = await getSession();
  if (!session?.tenantId) redirect("/signin");
  return session.tenantId;
}

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

/** Sets or clears the dashboard's manual estimated-audit-ready-month override. */
export async function updateEstDateAction(monthValue: string): Promise<void> {
  const tenantId = await requireTenantId();
  setEstDateOverride(tenantId, monthValue ? monthInputValueToEst(monthValue) : null);
}

/** Cycles an activity's status forward through STATUSES, e.g. by clicking its status pill in a table row. */
export async function cycleActivityStatusAction(ref: string, current: ActivityStatus): Promise<void> {
  const tenantId = await requireTenantId();
  setActivityStatus(tenantId, ref, nextStatus(current));
}

export async function setActivityStatusAction(ref: string, status: ActivityStatus): Promise<void> {
  const tenantId = await requireTenantId();
  setActivityStatus(tenantId, ref, status);
}

export async function setActivityPriorityAction(ref: string, priority: Priority): Promise<void> {
  const tenantId = await requireTenantId();
  setActivityPriority(tenantId, ref, priority);
}

export async function setActivityPhaseAction(ref: string, phase: Phase): Promise<void> {
  const tenantId = await requireTenantId();
  setActivityPhase(tenantId, ref, phase);
}

export async function setActivityEffortAction(ref: string, effort: Effort): Promise<void> {
  const tenantId = await requireTenantId();
  setActivityEffort(tenantId, ref, effort);
}

export async function setActivityOwnerAction(ref: string, owner: string): Promise<void> {
  const tenantId = await requireTenantId();
  setActivityOwner(tenantId, ref, owner);
}

/** `isoDate` comes from an <input type="date">; stored back in the design's Danish display format. */
export async function setActivityTargetAction(ref: string, isoDate: string): Promise<void> {
  const dk = isoDateToDk(isoDate);
  if (!dk) return;
  const tenantId = await requireTenantId();
  setActivityTarget(tenantId, ref, dk);
}

export async function addActivityEvidenceAction(ref: string, label: string, url: string): Promise<void> {
  const normalized = normalizeUrl(url);
  if (!normalized) return;
  const finalLabel = label.trim() || normalized.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const tenantId = await requireTenantId();
  addActivityEvidence(tenantId, ref, { label: finalLabel, url: normalized });
}

export async function removeActivityEvidenceAction(ref: string, index: number): Promise<void> {
  const tenantId = await requireTenantId();
  removeActivityEvidence(tenantId, ref, index);
}

export async function setAdvisorNoteAction(ref: string, note: string): Promise<void> {
  const tenantId = await requireTenantId();
  setAdvisorNote(tenantId, ref, note);
}

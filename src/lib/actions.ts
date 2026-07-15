"use server";

import { redirect } from "next/navigation";
import { getSession, clearSession, setSession } from "./session";
import {
  addActivityEvidence,
  addDocument,
  addPolicySection,
  completeRecurring,
  publishDocument,
  publishPolicy,
  removeActivityEvidence,
  removePolicySection,
  reopenDocument,
  reopenPolicy,
  sendDocumentToReview,
  sendPolicyToReview,
  setActivityEffort,
  setActivityOwner,
  setActivityPhase,
  setActivityPriority,
  setActivityStatus,
  setActivityTarget,
  setAdvisorNote,
  setDocumentApprover,
  setDocumentBody,
  setDocumentOwner,
  setDocumentReview,
  setDocumentStage,
  setDocumentTitle,
  setEstDateOverride,
  setPolicyBumpKind,
  setPolicyOwner,
  setPolicySectionBody,
  setPolicySectionTitle,
  setRecurringCadence,
  setRecurringFormField,
  signDocument,
  signPolicy,
  toggleRecurringChecklistItem,
} from "./data/store";
import { isoDateToDk, monthInputValueToEst, nextStatus, normalizeUrl } from "./domain";
import type { ActivityStatus, DocLifecycleStage, Effort, Phase, Priority } from "./data/types";

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

export async function setDocumentTitleAction(num: number, title: string): Promise<void> {
  const tenantId = await requireTenantId();
  setDocumentTitle(tenantId, num, title);
}

export async function setDocumentOwnerAction(num: number, owner: string): Promise<void> {
  const tenantId = await requireTenantId();
  setDocumentOwner(tenantId, num, owner);
}

export async function setDocumentApproverAction(num: number, approver: string): Promise<void> {
  const tenantId = await requireTenantId();
  setDocumentApprover(tenantId, num, approver);
}

export async function setDocumentReviewAction(num: number, review: string): Promise<void> {
  const tenantId = await requireTenantId();
  setDocumentReview(tenantId, num, review);
}

export async function setDocumentBodyAction(num: number, body: string): Promise<void> {
  const tenantId = await requireTenantId();
  setDocumentBody(tenantId, num, body);
}

export async function setDocumentStageAction(num: number, stage: DocLifecycleStage): Promise<void> {
  const tenantId = await requireTenantId();
  setDocumentStage(tenantId, num, stage);
}

export async function sendDocumentToReviewAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  sendDocumentToReview(tenantId, num);
}

export async function signDocumentAction(num: number, kind: "review" | "approve", name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const tenantId = await requireTenantId();
  signDocument(tenantId, num, kind, trimmed);
}

export async function publishDocumentAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  publishDocument(tenantId, num);
}

export async function reopenDocumentAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  reopenDocument(tenantId, num);
}

/** Creates a blank controlled document and opens it in the register, matching the design's addDocRow(). */
export async function addDocumentAction(): Promise<void> {
  const tenantId = await requireTenantId();
  const num = addDocument(tenantId);
  redirect(`/docs?tab=register&sel=${num}`);
}

export async function setPolicySectionBodyAction(num: number, text: string): Promise<void> {
  const tenantId = await requireTenantId();
  setPolicySectionBody(tenantId, num, text);
}

export async function setPolicySectionTitleAction(num: number, title: string, custom: boolean): Promise<void> {
  const tenantId = await requireTenantId();
  setPolicySectionTitle(tenantId, num, title, custom);
}

/** Adds a custom policy section and opens it, matching the design's confirmAddPolicy(). */
export async function addPolicySectionAction(title: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) return;
  const tenantId = await requireTenantId();
  const num = addPolicySection(tenantId, trimmed);
  redirect(`/policy?sel=${num}`);
}

export async function removePolicySectionAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  removePolicySection(tenantId, num);
  redirect("/policy?sel=1");
}

export async function setPolicyOwnerAction(owner: string): Promise<void> {
  const tenantId = await requireTenantId();
  setPolicyOwner(tenantId, owner);
}

export async function setPolicyBumpKindAction(kind: "minor" | "major"): Promise<void> {
  const tenantId = await requireTenantId();
  setPolicyBumpKind(tenantId, kind);
}

export async function sendPolicyToReviewAction(): Promise<void> {
  const tenantId = await requireTenantId();
  sendPolicyToReview(tenantId);
}

export async function signPolicyAction(kind: "review" | "approve", name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const tenantId = await requireTenantId();
  signPolicy(tenantId, kind, trimmed);
}

export async function publishPolicyAction(): Promise<void> {
  const tenantId = await requireTenantId();
  publishPolicy(tenantId);
}

export async function reopenPolicyAction(): Promise<void> {
  const tenantId = await requireTenantId();
  reopenPolicy(tenantId);
}

export async function setRecurringCadenceAction(control: string, cadence: string): Promise<void> {
  const tenantId = await requireTenantId();
  setRecurringCadence(tenantId, control, cadence);
}

export async function setRecurringFormFieldAction(control: string, key: string, value: unknown): Promise<void> {
  const tenantId = await requireTenantId();
  setRecurringFormField(tenantId, control, key, value);
}

export async function toggleRecurringChecklistItemAction(control: string, fieldKey: string, idx: number): Promise<void> {
  const tenantId = await requireTenantId();
  toggleRecurringChecklistItem(tenantId, control, fieldKey, idx);
}

export async function completeRecurringAction(control: string): Promise<void> {
  const tenantId = await requireTenantId();
  completeRecurring(tenantId, control);
}

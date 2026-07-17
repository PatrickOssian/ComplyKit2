"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";
import { getAuthUser, getWorkspace, setWorkspace, clearWorkspace } from "./session";
import {
  addActivityEvidence,
  addDocument,
  addPolicySection,
  completeRecurring,
  getMembership,
  getTenant,
  inviteMember,
  publishDocument,
  publishPolicy,
  removeActivityEvidence,
  removeMember,
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
  setBillingPlan,
  setDocumentApprover,
  setDocumentBody,
  setDocumentOwner,
  setDocumentReview,
  setDocumentStage,
  setDocumentTitle,
  setEstDateOverride,
  setMemberRole,
  setPolicyBumpKind,
  setPolicyOwner,
  setPolicySectionBody,
  setPolicySectionTitle,
  setRecurringCadence,
  setRecurringFormField,
  signDocument,
  signPendingDocument,
  signPolicy,
  toggleNavSectionHidden,
  toggleRecurringChecklistItem,
} from "./data/store";
import { isoDateToDk, monthInputValueToEst, nextStatus, normalizeUrl } from "./domain";
import type { ActivityStatus, DocLifecycleStage, Effort, Phase, Priority, RoleName } from "./data/types";

async function requireTenantId(): Promise<string> {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  const workspace = await getWorkspace();
  if (!workspace.tenantId) redirect("/signin");
  return workspace.tenantId;
}

/** Real display name of the signed-in user, for stamping audit-log entries. */
async function requireUser(): Promise<{ id: string; name: string }> {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  return authUser;
}

/** Server-side enforcement that the caller can manage this tenant's
 * workspace settings — the local Admin, or the Stage One advisor browsing
 * with cross-tenant rights. `advisorMode` is checked first because a
 * membership-derived role only resolves to "Advisor" at tenants the advisor
 * has a real row for (today, only "np") — everywhere else it falls back to
 * that tenant's static seed role, so keying purely on role would miss the
 * advisor at every other client site. The settings UI already hides this
 * control from ineligible roles, but that's cosmetic; this is the real gate. */
async function requireCanManageNavSections(tenantId: string): Promise<void> {
  const workspace = await getWorkspace();
  if (workspace.advisorMode) return;
  const user = await requireUser();
  const membership = await getMembership(user.id, tenantId);
  const tenant = await getTenant(tenantId);
  const role = membership?.role ?? tenant?.role;
  if (role !== "Admin") {
    throw new Error("Kun Admin eller rådgiver kan ændre synlige sektioner.");
  }
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  await clearWorkspace();
  redirect("/signin");
}

/** Picking a tenant card in the workspace switcher. The "so" pseudo-tenant
 * (Stage One Advisor) drops you into Nordic Pharma's workspace with
 * advisorMode enabled, matching ComplyKit.dc.html's pickTenant(). Advisor
 * mode for any other tenant comes from that user's real membership row. */
export async function pickTenantAction(tenantId: string): Promise<void> {
  const user = await requireUser();
  const workspace = await getWorkspace();
  const resolvedTenantId = tenantId === "so" ? "np" : tenantId;
  let advisorMode = tenantId === "so";
  if (!advisorMode) {
    const membership = await getMembership(user.id, resolvedTenantId);
    advisorMode = membership?.advisorMode ?? false;
  }
  await setWorkspace({ tenantId: resolvedTenantId, advisorMode, gxp: workspace.gxp });
  redirect("/dashboard");
}

/** Advisor-only client-site switch from the side-rail dropdown (stays in the app shell). */
export async function pickOrgAction(tenantId: string): Promise<void> {
  const workspace = await getWorkspace();
  await setWorkspace({ tenantId, advisorMode: workspace.advisorMode, gxp: workspace.gxp });
  redirect("/dashboard");
}

export async function switchWorkspaceAction(): Promise<void> {
  const workspace = await getWorkspace();
  await setWorkspace({ tenantId: null, advisorMode: workspace.advisorMode, gxp: workspace.gxp });
  redirect("/workspace");
}

export async function toggleGxpAction(): Promise<void> {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  const workspace = await getWorkspace();
  await setWorkspace({ ...workspace, gxp: !workspace.gxp });
}

/** Admin-only: shows/hides a workspace nav section (e.g. "roadmap") for
 * every member of this tenant. Cosmetic — never touches the underlying data. */
export async function toggleNavSectionAction(key: string): Promise<void> {
  const tenantId = await requireTenantId();
  await requireCanManageNavSections(tenantId);
  await toggleNavSectionHidden(tenantId, key);
}

/** Sets or clears the dashboard's manual estimated-audit-ready-month override. */
export async function updateEstDateAction(monthValue: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setEstDateOverride(tenantId, monthValue ? monthInputValueToEst(monthValue) : null);
}

/** Cycles an activity's status forward through STATUSES, e.g. by clicking its status pill in a table row. */
export async function cycleActivityStatusAction(ref: string, current: ActivityStatus): Promise<void> {
  const tenantId = await requireTenantId();
  await setActivityStatus(tenantId, ref, nextStatus(current));
}

export async function setActivityStatusAction(ref: string, status: ActivityStatus): Promise<void> {
  const tenantId = await requireTenantId();
  await setActivityStatus(tenantId, ref, status);
}

export async function setActivityPriorityAction(ref: string, priority: Priority): Promise<void> {
  const tenantId = await requireTenantId();
  await setActivityPriority(tenantId, ref, priority);
}

export async function setActivityPhaseAction(ref: string, phase: Phase): Promise<void> {
  const tenantId = await requireTenantId();
  await setActivityPhase(tenantId, ref, phase);
}

export async function setActivityEffortAction(ref: string, effort: Effort): Promise<void> {
  const tenantId = await requireTenantId();
  await setActivityEffort(tenantId, ref, effort);
}

export async function setActivityOwnerAction(ref: string, owner: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setActivityOwner(tenantId, ref, owner);
}

/** `isoDate` comes from an <input type="date">; stored back in the design's Danish display format. */
export async function setActivityTargetAction(ref: string, isoDate: string): Promise<void> {
  const dk = isoDateToDk(isoDate);
  if (!dk) return;
  const tenantId = await requireTenantId();
  await setActivityTarget(tenantId, ref, dk);
}

export async function addActivityEvidenceAction(ref: string, label: string, url: string): Promise<void> {
  const normalized = normalizeUrl(url);
  if (!normalized) return;
  const finalLabel = label.trim() || normalized.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const tenantId = await requireTenantId();
  await addActivityEvidence(tenantId, ref, { label: finalLabel, url: normalized });
}

export async function removeActivityEvidenceAction(ref: string, index: number): Promise<void> {
  const tenantId = await requireTenantId();
  await removeActivityEvidence(tenantId, ref, index);
}

export async function setAdvisorNoteAction(ref: string, note: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setAdvisorNote(tenantId, ref, note);
}

export async function setDocumentTitleAction(num: number, title: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setDocumentTitle(tenantId, num, title);
}

export async function setDocumentOwnerAction(num: number, owner: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setDocumentOwner(tenantId, num, owner);
}

export async function setDocumentApproverAction(num: number, approver: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setDocumentApprover(tenantId, num, approver);
}

export async function setDocumentReviewAction(num: number, review: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setDocumentReview(tenantId, num, review);
}

export async function setDocumentBodyAction(num: number, body: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setDocumentBody(tenantId, num, body);
}

export async function setDocumentStageAction(num: number, stage: DocLifecycleStage): Promise<void> {
  const tenantId = await requireTenantId();
  await setDocumentStage(tenantId, num, stage);
}

export async function sendDocumentToReviewAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  await sendDocumentToReview(tenantId, num);
}

export async function signDocumentAction(num: number, kind: "review" | "approve", name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const tenantId = await requireTenantId();
  await signDocument(tenantId, num, kind, trimmed);
}

export async function publishDocumentAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  await publishDocument(tenantId, num);
}

export async function reopenDocumentAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  await reopenDocument(tenantId, num);
}

/** Creates a blank controlled document and opens it in the register, matching the design's addDocRow(). */
export async function addDocumentAction(): Promise<void> {
  const tenantId = await requireTenantId();
  const num = await addDocument(tenantId);
  redirect(`/docs?tab=register&sel=${num}`);
}

export async function setPolicySectionBodyAction(num: number, text: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setPolicySectionBody(tenantId, num, text);
}

export async function setPolicySectionTitleAction(num: number, title: string, custom: boolean): Promise<void> {
  const tenantId = await requireTenantId();
  await setPolicySectionTitle(tenantId, num, title, custom);
}

/** Adds a custom policy section and opens it, matching the design's confirmAddPolicy(). */
export async function addPolicySectionAction(title: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) return;
  const tenantId = await requireTenantId();
  const num = await addPolicySection(tenantId, trimmed);
  redirect(`/policy?sel=${num}`);
}

export async function removePolicySectionAction(num: number): Promise<void> {
  const tenantId = await requireTenantId();
  await removePolicySection(tenantId, num);
  redirect("/policy?sel=1");
}

export async function setPolicyOwnerAction(owner: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setPolicyOwner(tenantId, owner);
}

export async function setPolicyBumpKindAction(kind: "minor" | "major"): Promise<void> {
  const tenantId = await requireTenantId();
  await setPolicyBumpKind(tenantId, kind);
}

export async function sendPolicyToReviewAction(): Promise<void> {
  const tenantId = await requireTenantId();
  await sendPolicyToReview(tenantId);
}

export async function signPolicyAction(kind: "review" | "approve", name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const tenantId = await requireTenantId();
  await signPolicy(tenantId, kind, trimmed);
}

export async function publishPolicyAction(): Promise<void> {
  const tenantId = await requireTenantId();
  await publishPolicy(tenantId);
}

export async function reopenPolicyAction(): Promise<void> {
  const tenantId = await requireTenantId();
  await reopenPolicy(tenantId);
}

export async function setRecurringCadenceAction(control: string, cadence: string): Promise<void> {
  const tenantId = await requireTenantId();
  await setRecurringCadence(tenantId, control, cadence);
}

export async function setRecurringFormFieldAction(control: string, key: string, value: unknown): Promise<void> {
  const tenantId = await requireTenantId();
  await setRecurringFormField(tenantId, control, key, value);
}

export async function toggleRecurringChecklistItemAction(control: string, fieldKey: string, idx: number): Promise<void> {
  const tenantId = await requireTenantId();
  await toggleRecurringChecklistItem(tenantId, control, fieldKey, idx);
}

export async function completeRecurringAction(control: string): Promise<void> {
  const tenantId = await requireTenantId();
  await completeRecurring(tenantId, control);
}

export async function inviteMemberAction(email: string, role: RoleName): Promise<void> {
  const tenantId = await requireTenantId();
  const user = await requireUser();
  await inviteMember(tenantId, user.name, email, role);
}

export async function removeMemberAction(email: string): Promise<void> {
  const tenantId = await requireTenantId();
  const user = await requireUser();
  await removeMember(tenantId, user.name, email);
}

export async function setMemberRoleAction(email: string, role: RoleName): Promise<void> {
  const tenantId = await requireTenantId();
  await setMemberRole(tenantId, email, role);
}

export async function setBillingPlanAction(plan: "essentials" | "compliance" | "gxp"): Promise<void> {
  const tenantId = await requireTenantId();
  await setBillingPlan(tenantId, plan);
}

export async function signPendingDocumentAction(id: string, meaning: string): Promise<void> {
  const tenantId = await requireTenantId();
  const user = await requireUser();
  await signPendingDocument(tenantId, user.name, id, meaning);
}

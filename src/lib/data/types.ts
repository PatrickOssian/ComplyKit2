// Core domain types for ComplyKit, ported from the ComplyKit.dc.html design
// prototype and its seed data modules (complykit-data.js / procedure-drafts.js /
// recurring-templates.js).

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Effort = "XS" | "S" | "M" | "L" | "XL";
export type Phase = "Phase 0" | "Phase 1" | "Phase 2" | "Phase 3";
export type ActivityStatus =
  | "Not started"
  | "In progress"
  | "Implemented"
  | "Approved plan"
  | "Deferred"
  | "N/A";
export type DocLifecycleStage =
  | "Not started"
  | "Drafting"
  | "In review"
  | "Approved"
  | "Published";
export type PolicyStage = "Kladde" | "I review" | "Godkendt" | "Publiceret";
export type RoleName = "Admin" | "Editor" | "Auditor" | "Viewer" | "Advisor";

export interface Tag {
  label: string;
  gxp: boolean;
}

export interface EvidenceLink {
  label: string;
  url: string;
}

export interface Activity {
  ref: string;
  area: string;
  action: string;
  desc: string;
  deliverable: string;
  owner: string;
  priority: Priority;
  effort: Effort;
  phase: Phase;
  cadence: string;
  deps: string[];
  policyRef: string;
  standards: string;
  tags: Tag[];
  frameworks: string[];
  gxp: boolean;
  target: string;
  status: ActivityStatus;
  notes: string;
  evidence?: EvidenceLink[];
}

export interface DocStage {
  ref: string;
  stage: string;
  scope: string;
  deliverable: string;
  owner: string;
  priority: Priority;
  phase: Phase;
  linkedA: string[];
  policyRef: string;
  status: DocLifecycleStage;
}

export interface FoundationItem {
  ref: string;
  title: string;
  type: "Standard" | "Procedure" | "Register";
  stage: string;
  scope: string;
  deliverable: string;
  owner: string;
  priority: Priority;
  phase: Phase;
  policyRef: string;
}

export interface Signature {
  name: string;
  role: "Reviewer" | "Approver";
  meaning: string;
  when: string;
}

export interface ControlledDocument {
  num: number;
  title: string;
  type: "Procedure" | "Guideline" | "Material";
  owner: string;
  approver: string;
  policyRef: string;
  review: string;
  version: string;
  docStage: DocLifecycleStage;
  gxp: boolean;
  frameworks: string[];
  effective: string;
  repo: string;
  stages: DocStage[];
  body?: string;
  reviewSig?: Signature | null;
  approveSig?: Signature | null;
}

export interface PolicySection {
  num: number;
  title: string;
  body: string[];
  gxp?: boolean;
  custom?: boolean;
}

export interface RoadmapPhase {
  phase: Phase;
  name: string;
  time: string;
  focus: string;
  exit: string;
}

export interface RecurringHistoryEntry {
  when: string;
  outcome: string;
  form: Record<string, unknown>;
}

export interface RecurringControl {
  control: string;
  cadence: string;
  owner: string;
  policyRef: string;
  next: string;
  lastDone?: string | null;
  history?: RecurringHistoryEntry[];
  form?: Record<string, unknown>;
}

export type RecurringFieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number"
  | "checklist";

export interface RecurringTemplateField {
  key: string;
  label: string;
  type: RecurringFieldType;
  placeholder?: string;
  unit?: string;
  options?: string[];
  items?: string[];
  full?: boolean;
}

export interface RecurringTemplateSection {
  title: string;
  fields: RecurringTemplateField[];
}

export interface RecurringTemplate {
  purpose: string;
  est: string;
  sections: RecurringTemplateSection[];
}

export interface Framework {
  key: string;
  short: string;
  gxp: boolean;
  desc: string;
}

export interface PolicyMeta {
  org: string;
  policyStatus: string;
  policyVersion: string;
  validFrom: string;
  owner: string;
  approvedBy: string;
  nextReview: string;
}

// ---- Tenant / member / billing / audit (not in the seed .js files — ported
// from the initial `state` object embedded in ComplyKit.dc.html) ----

export interface Tenant {
  id: string;
  name: string;
  short: string;
  sector: string;
  role: RoleName;
  plan: string;
  users: number;
  gxp: boolean;
  tint: string;
}

export interface Member {
  name: string;
  email: string;
  role: RoleName;
  sso: boolean;
  status: "Active" | "Invited" | "Advisor";
  last: string;
  init: string;
  you?: boolean;
  advisor?: boolean;
}

export interface Invoice {
  date: string;
  amount: string;
  plan: string;
  status: "Paid" | "Due" | "Overdue";
}

export interface AuditEvent {
  time: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  hash: string;
}

export interface PendingSignature {
  id: string;
  doc: string;
  version: string;
  role: "Reviewer" | "Approver";
  requested: string;
  due: string;
  gxp: boolean;
}

export interface SignedRecord {
  doc: string;
  version: string;
  meaning: string;
  when: string;
}

export interface DemoLogin {
  email: string;
  role: string;
}

export interface AdvisorIdentity {
  firm: string;
  name: string;
  role: string;
  nextReview: string;
  initials: string;
  phone: string;
  phoneHref: string;
}

export interface AdvisorActivityEntry {
  when: string;
  text: string;
}

export interface HelpGuideStep {
  n: number;
  text: string;
}

export interface HelpGuide {
  id: string;
  icon: string;
  title: string;
  desc: string;
  steps: string[];
}

export interface NavDef {
  v: string;
  label: string;
  icon: string;
}

export interface AdminNavDef {
  k: string;
  label: string;
  icon: string;
}

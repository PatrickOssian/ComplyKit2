// Pure domain logic ported from ComplyKit.dc.html (role/priority styling
// tokens, readiness scoring, date/hash formatting helpers). No React, no
// data fetching — safe to import from server or client code.

import type {
  Activity,
  ActivityStatus,
  ControlledDocument,
  DocLifecycleStage,
  Effort,
  Phase,
  Priority,
  RoleName,
} from "./data/types";

export const ROLES: RoleName[] = ["Admin", "Editor", "Auditor", "Viewer"];

export const STATUSES: ActivityStatus[] = [
  "Not started",
  "In progress",
  "Implemented",
  "Approved plan",
  "Deferred",
  "N/A",
];
export const PRIOS: Priority[] = ["Critical", "High", "Medium", "Low"];
export const PHASES: Phase[] = ["Phase 0", "Phase 1", "Phase 2", "Phase 3"];
export const EFFORTS: Effort[] = ["XS", "S", "M", "L", "XL"];
export const OWNER_ROLES = [
  "Executive Management",
  "Information Security Officer",
  "IT",
  "IT / MSP",
  "System Owners",
  "Data Owners",
  "HR",
  "Project Leads",
  "ISO",
];

export function nextStatus(current: ActivityStatus): ActivityStatus {
  return STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length];
}

export const DOCSTAGES: DocLifecycleStage[] = ["Not started", "Drafting", "In review", "Approved", "Published"];

export interface DocStageMeta {
  dot: string;
  bg: string;
  fg: string;
  da: string;
}

const DOC_STAGE_META: Record<DocLifecycleStage, DocStageMeta> = {
  "Not started": { dot: "#98a2b3", bg: "#f2f4f7", fg: "#667085", da: "Ikke startet" },
  Drafting: { dot: "#f79009", bg: "#fffaeb", fg: "#b54708", da: "Kladde" },
  "In review": { dot: "#2e90fa", bg: "#eff8ff", fg: "#175cd3", da: "I review" },
  Approved: { dot: "#7a5af8", bg: "#f4f3ff", fg: "#5925dc", da: "Godkendt" },
  Published: { dot: "#12b76a", bg: "#ecfdf3", fg: "#067647", da: "Publiceret" },
};

export function docStageMeta(s: string): DocStageMeta {
  return (DOC_STAGE_META as Record<string, DocStageMeta>)[s] ?? { dot: "#98a2b3", bg: "#f2f4f7", fg: "#667085", da: s };
}

const STAGE_ROW_META: Record<string, { dot: string; fg: string }> = {
  "Not started": { dot: "#98a2b3", fg: "#667085" },
  Drafting: { dot: "#f79009", fg: "#b54708" },
  "In review": { dot: "#2e90fa", fg: "#175cd3" },
  Approved: { dot: "#7a5af8", fg: "#5925dc" },
  Published: { dot: "#12b76a", fg: "#067647" },
};

export function stageRowMeta(s: string): { dot: string; fg: string } {
  return STAGE_ROW_META[s] ?? { dot: "#98a2b3", fg: "#667085" };
}

export interface RoleMeta {
  bg: string;
  fg: string;
  bd: string;
  dot: string;
  desc: string;
}

const ROLE_META: Record<RoleName, RoleMeta> = {
  Admin: { bg: "#eef1fe", fg: "#3538cd", bd: "#d8dffb", dot: "#3538cd", desc: "Full control · billing, members & settings" },
  Editor: { bg: "#ecfdf3", fg: "#067647", bd: "#c9f0da", dot: "#12b76a", desc: "Author & edit records · no billing" },
  Auditor: { bg: "#f4f3ff", fg: "#5925dc", bd: "#e9d7fe", dot: "#7a5af8", desc: "Read-only + e-signature sign-off" },
  Advisor: { bg: "#fff8ec", fg: "#b54708", bd: "#fce4b8", dot: "#f79009", desc: "Stage One advisor · cross-tenant guidance & review" },
  Viewer: { bg: "#f2f4f7", fg: "#475467", bd: "#eaecf0", dot: "#98a2b3", desc: "Read-only access to published records" },
};

export function roleMeta(role: RoleName): RoleMeta {
  return ROLE_META[role] ?? { bg: "#f2f4f7", fg: "#475467", bd: "#eaecf0", dot: "#98a2b3", desc: "" };
}

export interface PriorityMeta {
  bg: string;
  fg: string;
  bar: string;
  solid?: boolean;
}

const PRIORITY_META: Record<Priority, PriorityMeta> = {
  Critical: { bg: "#d92d20", fg: "#fff", bar: "#d92d20", solid: true },
  High: { bg: "#fffaeb", fg: "#b54708", bar: "#f79009" },
  Medium: { bg: "#f2f4f7", fg: "#475467", bar: "#98a2b3" },
  Low: { bg: "#f9fafb", fg: "#667085", bar: "#d0d5dd" },
};

export function prioMeta(p: Priority): PriorityMeta {
  return PRIORITY_META[p] ?? { bg: "#f2f4f7", fg: "#475467", bar: "#98a2b3" };
}

const AVATAR_COLORS: [string, string][] = [
  ["#eef1fe", "#3538cd"],
  ["#ecfdf3", "#067647"],
  ["#f4f3ff", "#5925dc"],
  ["#fff5ec", "#b54708"],
  ["#eff8ff", "#175cd3"],
  ["#fef3f2", "#b42318"],
];

export function avaColor(i: number): [string, string] {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

export interface ReadinessState {
  label: string;
  color: string;
  bg: string;
}

export function readinessState(pct: number): ReadinessState {
  if (pct >= 95) return { label: "Audit-klar", color: "#12b76a", bg: "#ecfdf3" };
  if (pct >= 80) return { label: "Næsten audit-klar", color: "#12b76a", bg: "#ecfdf3" };
  if (pct >= 50) return { label: "Godt på vej", color: "#3538cd", bg: "#eef1fe" };
  if (pct >= 20) return { label: "På vej", color: "#b54708", bg: "#fffaeb" };
  return { label: "Opstart", color: "#b54708", bg: "#fffaeb" };
}

export function isDone(a: Activity): boolean {
  return a.status === "Implemented" || a.status === "Approved plan";
}

export function isDocDone(d: ControlledDocument): boolean {
  return d.docStage === "Published" || d.docStage === "Approved";
}

export interface StatusMeta {
  dot: string;
  bg: string;
  fg: string;
}

const STATUS_META: Record<ActivityStatus, StatusMeta> = {
  "Not started": { dot: "#98a2b3", bg: "#f2f4f7", fg: "#667085" },
  "In progress": { dot: "#f79009", bg: "#fffaeb", fg: "#b54708" },
  Implemented: { dot: "#12b76a", bg: "#ecfdf3", fg: "#067647" },
  "Approved plan": { dot: "#2e90fa", bg: "#eff8ff", fg: "#175cd3" },
  Deferred: { dot: "#7a5af8", bg: "#f4f3ff", fg: "#5925dc" },
  "N/A": { dot: "#d0d5dd", bg: "#f9fafb", fg: "#98a2b3" },
};

export function statusMeta(s: ActivityStatus): StatusMeta {
  return STATUS_META[s] ?? { dot: "#98a2b3", bg: "#f2f4f7", fg: "#667085" };
}

const DK_MO = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export function formatDkDate(d: Date): string {
  return `${d.getDate()} ${DK_MO[d.getMonth()]} ${d.getFullYear()}`;
}

/** Parses ComplyKit's Danish "15 jul 2026" date strings back into a Date. */
export function parseDkDate(str: string | undefined | null): Date | null {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})\s+([a-zæøå]+)\s+(\d{4})$/i);
  if (!m) return null;
  const mi = DK_MO.indexOf(m[2].toLowerCase().slice(0, 3));
  if (mi < 0) return null;
  return new Date(Number(m[3]), mi, Number(m[1]));
}

export function todayDate(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

export function isOverdue(a: Activity): boolean {
  if (isDone(a)) return false;
  const d = parseDkDate(a.target);
  return !!d && d < todayDate();
}

/** Estimated audit-ready month: validFrom + 12 months, or the tenant's manual override. */
export function estAuditReady(validFrom: string, override: string | null): string {
  if (override) return override;
  const base = parseDkDate(validFrom) ?? todayDate();
  const d = new Date(base.getFullYear(), base.getMonth() + 12, 1);
  return `${DK_MO[d.getMonth()]} ${d.getFullYear()}`;
}

/** Converts an "jul 2026"-style display string to a <input type="month"> value. */
export function estToMonthInputValue(estDate: string): string {
  const [mon, yr] = estDate.split(" ");
  const mi = DK_MO.indexOf(mon);
  const year = parseInt(yr, 10);
  if (mi < 0 || !year) return "";
  return `${year}-${String(mi + 1).padStart(2, "0")}`;
}

/** Converts an <input type="month"> value ("2026-07") back to "jul 2026". */
export function monthInputValueToEst(value: string): string {
  const [yr, mo] = value.split("-");
  return `${DK_MO[parseInt(mo, 10) - 1]} ${yr}`;
}

/** "15 jul 2026" -> "2026-07-15", for <input type="date"> values. */
export function dkDateToIso(str: string | undefined | null): string {
  if (!str) return "";
  const parts = String(str).trim().split(/\s+/);
  if (parts.length < 3) return "";
  const day = parts[0].padStart(2, "0");
  const mi = DK_MO.indexOf(parts[1].toLowerCase());
  if (mi < 0) return "";
  return `${parts[2]}-${String(mi + 1).padStart(2, "0")}-${day}`;
}

/** "2026-07-15" -> "15 jul 2026", the reverse of dkDateToIso(). */
export function isoDateToDk(iso: string | undefined | null): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length < 3) return "";
  const mi = parseInt(parts[1], 10) - 1;
  if (mi < 0 || mi > 11) return "";
  return `${parseInt(parts[2], 10)} ${DK_MO[mi]} ${parts[0]}`;
}

/** Normalizes a user-entered evidence URL, defaulting to https:// if no scheme given. */
export function normalizeUrl(u: string | undefined | null): string {
  const trimmed = (u ?? "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function formatDkDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDkDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function auditStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Mock tamper-evident-looking hash — NOT real cryptography. Matches the design's rndHash(). */
export function rndHash(): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 8; i++) out += hex[Math.floor(Math.random() * 16)];
  return `${out}…`;
}

export function bumpVersion(version: string): string {
  const n = parseFloat(version || "0.1") || 0.1;
  return (Math.round((n + 0.1) * 10) / 10).toFixed(1);
}

export const CADENCE_MONTHS: Record<string, number> = {
  Monthly: 1,
  Quarterly: 3,
  "Semi-annual": 6,
  Annual: 12,
  "Annual (or on change)": 12,
};

export function nextDueFromCadence(cadence: string, from: Date): string {
  const n = CADENCE_MONTHS[cadence] ?? 12;
  const d = new Date(from.getFullYear(), from.getMonth() + n, from.getDate());
  return formatDkDate(d);
}

export const CADS = ["Monthly", "Quarterly", "Semi-annual", "Annual"];

export function cadenceColor(cadence: string): string {
  if (/Month/i.test(cadence)) return "#b54708";
  if (/Quarter/i.test(cadence)) return "#3538cd";
  if (/Semi/i.test(cadence)) return "#7a5af8";
  return "#0e9384";
}

export function auditCategory(action: string): string {
  const c = action.split(".")[0];
  if (c === "esignature") return "E-signatures";
  if (c === "document") return "Documents";
  if (c === "member") return "Members";
  if (c === "auth" || c === "access") return "Access";
  if (c === "billing") return "Billing";
  return "Other";
}

const AUDIT_ACTION_COLORS: Record<string, { fg: string; bg: string }> = {
  esignature: { fg: "#5925dc", bg: "#f4f3ff" },
  document: { fg: "#067647", bg: "#ecfdf3" },
  member: { fg: "#175cd3", bg: "#eff8ff" },
  auth: { fg: "#175cd3", bg: "#eff8ff" },
  billing: { fg: "#b54708", bg: "#fffaeb" },
  action: { fg: "#0e7090", bg: "#ecfeff" },
};

export function auditActionColor(action: string): { fg: string; bg: string } {
  const cat = action.split(".")[0];
  return AUDIT_ACTION_COLORS[cat] ?? { fg: "#475467", bg: "#f2f4f7" };
}

// Seed data ported from the initial `state` object embedded in
// ComplyKit.dc.html (tenants, members, billing, audit trail, advisor
// identity, nav definitions, help guides) plus re-exports of the seed
// modules extracted from the design bundle (complykit-data.js /
// procedure-drafts.js / recurring-templates.js).
//
// This is mock, in-memory data for the first implementation pass — no
// real database yet.

import type {
  AdminNavDef,
  AdvisorActivityEntry,
  AdvisorIdentity,
  AuditEvent,
  DemoLogin,
  HelpGuide,
  Invoice,
  Member,
  NavDef,
  PendingSignature,
  SignedRecord,
  Tenant,
} from "./types";

export {
  meta as policyMeta,
  activities,
  documents,
  foundation,
  policy as policySections,
  roadmap as roadmapPhases,
  recurring as recurringControls,
  frameworks,
} from "./raw/complykit-data";

export { drafts as procedureDrafts } from "./raw/procedure-drafts";
export {
  cadenceMonths,
  templates as recurringTemplates,
} from "./raw/recurring-templates";

export const tenants: Tenant[] = [
  {
    id: "np",
    name: "Nordic Pharma Logistics A/S",
    short: "NP",
    sector: "Pharma logistics · GxP",
    role: "Admin",
    plan: "GxP Validated",
    users: 14,
    gxp: true,
    tint: "#12b76a",
  },
  {
    id: "nz",
    name: "Novozym Bio",
    short: "NZ",
    sector: "Industrial enzymes",
    role: "Editor",
    plan: "Compliance",
    users: 9,
    gxp: false,
    tint: "#2e90fa",
  },
  {
    id: "rt",
    name: "Reykjavík Therapeutics",
    short: "RT",
    sector: "Cell & gene · GxP",
    role: "Auditor",
    plan: "GxP Validated",
    users: 22,
    gxp: true,
    tint: "#7a5af8",
  },
  {
    id: "so",
    name: "Stage One Advisor",
    short: "SO",
    sector: "Managed compliance service",
    role: "Advisor",
    plan: "Advisory",
    users: 3,
    gxp: false,
    tint: "#f79009",
  },
];

export const currentUser = {
  name: "Maria Krogh",
  email: "maria.krogh@northpharma.dk",
  init: "MK",
  role: "Admin" as const,
};

export const members: Member[] = [
  {
    name: "Maria Krogh",
    email: "maria.krogh@northpharma.dk",
    role: "Admin",
    sso: true,
    status: "Active",
    last: "2 min ago",
    init: "MK",
    you: true,
  },
  {
    name: "Anders Holm",
    email: "anders.holm@northpharma.dk",
    role: "Editor",
    sso: true,
    status: "Active",
    last: "1 h ago",
    init: "AH",
  },
  {
    name: "Sofie Lund",
    email: "sofie.lund@northpharma.dk",
    role: "Editor",
    sso: true,
    status: "Active",
    last: "Yesterday",
    init: "SL",
  },
  {
    name: "Peter Vestergaard",
    email: "p.vestergaard@northpharma.dk",
    role: "Auditor",
    sso: true,
    status: "Active",
    last: "3 d ago",
    init: "PV",
  },
  {
    name: "M. Sørensen",
    email: "m.sorensen@stageone.dk",
    role: "Auditor",
    sso: false,
    status: "Advisor",
    last: "5 d ago",
    init: "MS",
    advisor: true,
  },
  {
    name: "Jonas Iversen",
    email: "jonas.iversen@northpharma.dk",
    role: "Viewer",
    sso: true,
    status: "Active",
    last: "1 w ago",
    init: "JI",
  },
  {
    name: "QA mailbox",
    email: "qa@northpharma.dk",
    role: "Editor",
    sso: false,
    status: "Invited",
    last: "—",
    init: "?",
  },
];

export const invoices: Invoice[] = [
  { date: "01 Jun 2026", amount: "€790.00", plan: "Compliance · monthly", status: "Paid" },
  { date: "01 May 2026", amount: "€790.00", plan: "Compliance · monthly", status: "Paid" },
  { date: "01 Apr 2026", amount: "€790.00", plan: "Compliance · monthly", status: "Paid" },
  { date: "12 Mar 2026", amount: "€290.00", plan: "Essentials · monthly", status: "Paid" },
];

export const auditLog: AuditEvent[] = [
  {
    time: "2026-07-02 09:14:22",
    actor: "Maria Krogh",
    action: "esignature.apply",
    target: "SOP-011 System Access Control v1.0",
    ip: "62.243.14.7",
    hash: "a91f3c2e…",
  },
  {
    time: "2026-07-02 08:51:03",
    actor: "Anders Holm",
    action: "document.publish",
    target: "Information Security Policy v1.0",
    ip: "62.243.14.7",
    hash: "7d0b8ee1…",
  },
  {
    time: "2026-07-01 16:22:47",
    actor: "Maria Krogh",
    action: "member.role",
    target: "jonas.iversen → Viewer",
    ip: "62.243.14.7",
    hash: "2c5faa90…",
  },
  {
    time: "2026-07-01 14:03:10",
    actor: "Peter Vestergaard",
    action: "action.status",
    target: "A-2.3 MFA rollout → Implemented",
    ip: "188.64.2.51",
    hash: "b3e19d4c…",
  },
  {
    time: "2026-06-30 11:47:55",
    actor: "System · Entra ID",
    action: "auth.provision",
    target: "sofie.lund@northpharma.dk",
    ip: "—",
    hash: "f0a271bd…",
  },
  {
    time: "2026-06-29 10:12:31",
    actor: "Maria Krogh",
    action: "billing.plan",
    target: "Essentials → Compliance",
    ip: "62.243.14.7",
    hash: "9ce4402f…",
  },
  {
    time: "2026-06-28 15:22:09",
    actor: "Maria Krogh",
    action: "esignature.apply",
    target: "Information Security Policy v1.0",
    ip: "62.243.14.7",
    hash: "44db1a08…",
  },
];

export const pendingSignatures: PendingSignature[] = [
  {
    id: "d1",
    doc: "SOP-014 Backup & Restore",
    version: "Draft v0.9 → v1.0",
    role: "Approver",
    requested: "Anders Holm",
    due: "04 Jul 2026",
    gxp: true,
  },
  {
    id: "d2",
    doc: "Risk Assessment 2026-H2",
    version: "v1.0",
    role: "Reviewer",
    requested: "Sofie Lund",
    due: "08 Jul 2026",
    gxp: false,
  },
];

export const signedRecords: SignedRecord[] = [
  { doc: "SOP-011 System Access Control", version: "v1.0", meaning: "Approved", when: "02 Jul 2026 09:14" },
  { doc: "Information Security Policy", version: "v1.0", meaning: "Approved", when: "28 Jun 2026 15:22" },
  { doc: "SOP-006 Change Management", version: "v1.2", meaning: "Reviewed", when: "19 Jun 2026 11:40" },
];

export const demoLogins: DemoLogin[] = [
  { email: "iso@nordicpharma.demo", role: "Admin" },
  { email: "editor@nordicpharma.demo", role: "Editor" },
  { email: "auditor@nordicpharma.demo", role: "Auditor" },
  { email: "viewer@nordicpharma.demo", role: "Viewer" },
  { email: "advisor@stageone.dk", role: "advisor → Nordic Pharma" },
];

export const advisor: AdvisorIdentity = {
  firm: "Stage One",
  name: "M. Sørensen",
  role: "Lead-rådgiver",
  nextReview: "21 jul 2026",
  initials: "MS",
  phone: "+45 71 99 04 20",
  phoneHref: "+4571990420",
};

export const advisorActivity: AdvisorActivityEntry[] = [
  { when: "2 jul 2026", text: "Gennemgik udkast til adgangsstyrings-proceduren og markerede to åbne punkter." },
  { when: "27 jun 2026", text: "Kvalitetssikrede backup-gendannelsestesten (5.3) forud for audit-dokumentation." },
  { when: "19 jun 2026", text: "Opdaterede risikoregistret sammen med ISO efter kvartalsgennemgang." },
];

// Danish nav labels, matching the design's own NAV_T translation table rather
// than its (unused, English) navDef() — see ComplyKit.dc.html:1678 vs :2200.
// Kept consistent with the rest of the in-app UI, which is Danish-only.
export const navItems: NavDef[] = [
  { v: "overview", label: "Overblik", icon: "◧" },
  { v: "actions", label: "Handlingsplan", icon: "◎" },
  { v: "docs", label: "Dokumentplan", icon: "▤" },
  { v: "policy", label: "Politik", icon: "§" },
  { v: "roadmap", label: "Roadmap", icon: "◔" },
  { v: "standards", label: "Standarder", icon: "◈" },
];

export const adminNavItems: AdminNavDef[] = [
  { k: "members", label: "Medlemmer & roller", icon: "◍" },
  { k: "billing", label: "Fakturering & abonnement", icon: "⬡" },
  { k: "audit", label: "Audit-log", icon: "▦" },
  { k: "esign", label: "E-signaturer", icon: "✎" },
];

export const helpGuides: HelpGuide[] = [
  {
    id: "policy",
    icon: "§",
    title: "Editing & publishing the security policy",
    desc: "Draft, review, e-sign and publish a new version of your ISMS policy.",
    steps: [
      "Open Policy in the sidebar and pick the section you want to change.",
      "Edit the text inline — changes are saved to the current draft automatically.",
      "When ready, choose Send to review and select whether it is a minor or major version bump.",
      "The reviewer signs off first, then the approver — both signatures are captured with name and timestamp.",
      "Press Publish. The new version, valid-from date and version number are stamped and logged to the audit trail.",
    ],
  },
  {
    id: "actions",
    icon: "◎",
    title: "Working the action plan (My Security Plan)",
    desc: "Track activities by priority, assign owners and set target dates.",
    steps: [
      "Open My Security Plan. Activities are grouped by priority (Critical → N/A).",
      "Use the filters to narrow by priority, status or owner.",
      "Click an activity to open it, then set its owner, target date and status.",
      "Mark an activity Implemented or Approved plan once the control is in place.",
      "Overall progress in the sidebar updates automatically as activities are completed.",
    ],
  },
  {
    id: "docs",
    icon: "▤",
    title: "Managing controlled documents",
    desc: "Move a procedure through its lifecycle from draft to published.",
    steps: [
      "Open Documents and switch to the Lifecycle tab to see documents by stage.",
      "Click a document to open its drawer, then edit the draft body inline.",
      "Set the lifecycle stage and route it for review when the draft is ready.",
      "Capture the reviewer and approver e-signatures in sequence.",
      "Publish the document — it appears in the Document register with version and effective date.",
      "Use Add document in the register to create a new controlled document.",
    ],
  },
  {
    id: "recurring",
    icon: "◔",
    title: "Recurring controls & the roadmap",
    desc: "Keep periodic controls on schedule across phases 0–3.",
    steps: [
      "Open Roadmap to see phases and the calendar of recurring controls.",
      "Adjust a control's cadence (monthly, quarterly, semi-annual, annual) by clicking its cadence badge.",
      "Click a control to record an outcome and complete it.",
      "The next due date is calculated automatically from the cadence.",
    ],
  },
  {
    id: "audit",
    icon: "▦",
    title: "Preparing the audit / board pack",
    desc: "Generate a single readiness pack for auditors or management.",
    steps: [
      'Open the Dashboard and find the "To audit / board" card.',
      "Press Generate board / audit pack to build a live snapshot.",
      "Review readiness, open critical items, document status and policy in one overview.",
      "Download the pack as PDF to share with your auditor or board.",
    ],
  },
];

export const disclaimer =
  "ComplyKit understøtter alignment med de nævnte standarder. Organisationen bør ikke fremstå som certificeret, medmindre certificering er selvstændigt og eksplicit opnået.";

export interface PlanDef {
  key: "essentials" | "compliance" | "gxp";
  name: string;
  tagline: string;
  price: string;
  unit: string;
  seats: string;
  accent: string;
  features: string[];
}

export const planDefs: PlanDef[] = [
  {
    key: "essentials",
    name: "Essentials",
    tagline: "NIS2 baseline for a single team",
    price: "€290",
    unit: "/mo",
    seats: "Up to 5 users",
    accent: "#667085",
    features: [
      "ISMS policy editor",
      "Action plan (Appendix A)",
      "Controlled document register",
      "1 framework crosswalk",
      "Email support",
    ],
  },
  {
    key: "compliance",
    name: "Compliance",
    tagline: "Multi-user ISMS with full audit trail",
    price: "€790",
    unit: "/mo",
    seats: "Up to 25 users",
    accent: "#3538cd",
    features: [
      "Everything in Essentials",
      "Role-based access (RBAC)",
      "All framework crosswalks",
      "Immutable audit log",
      "SSO — Entra ID / SAML",
      "Priority support",
    ],
  },
  {
    key: "gxp",
    name: "GxP Validated",
    tagline: "21 CFR Part 11 & EU Annex 11 ready",
    price: "Custom",
    unit: "",
    seats: "Unlimited users",
    accent: "#7a5af8",
    features: [
      "Everything in Compliance",
      "Part 11 electronic signatures",
      "Validation & IQ/OQ evidence",
      "ALCOA+ record controls",
      "Advisor seat (Stage One)",
      "Dedicated success manager",
    ],
  },
];

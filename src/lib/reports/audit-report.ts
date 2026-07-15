// Printable audit/board-package report, ported from ComplyKit.dc.html's
// buildReportHtml(). Returns a self-contained HTML document string, opened
// in a new window/tab and printed via window.print() — matching the
// design's approach (no server-side PDF generation pipeline in this pass).

function esc(x: unknown): string {
  return String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface AuditReportBlockingRow {
  ref: string;
  action: string;
  owner: string;
  priority: string;
  target: string;
  status: string;
  overdue: boolean;
}

export interface AuditReportFrameworkRow {
  short: string;
  done: number;
  n: number;
  pct: number;
}

export interface AuditReportDocumentRow {
  num: number;
  title: string;
  type: string;
  version: string;
  docStage: "Not started" | "Drafting" | "In review" | "Approved" | "Published";
  approverName: string | null;
  reviewerName: string | null;
}

export interface AuditReportInput {
  orgName: string;
  today: string;
  readyPct: number;
  stateLabel: string;
  estDate: string;
  dcPct: number;
  blocking: AuditReportBlockingRow[];
  fwRoll: AuditReportFrameworkRow[];
  policyStatus: string;
  policyVersion: string;
  policyOwner: string;
  policyNextReview: string;
  policySectionCount: number;
  documents: AuditReportDocumentRow[];
}

const STAGE_DA: Record<string, string> = {
  "Not started": "Ikke startet",
  Drafting: "Kladde",
  "In review": "I review",
  Approved: "Godkendt",
  Published: "Publiceret",
};
const STAGE_COL: Record<string, string> = {
  "Not started": "#98a2b3",
  Drafting: "#98a2b3",
  "In review": "#b54708",
  Approved: "#3538cd",
  Published: "#067647",
};
const PRIO_COL: Record<string, string> = {
  Critical: "#b42318",
  High: "#b54708",
  Medium: "#3538cd",
  Low: "#667085",
};
const barCol = (p: number) => (p >= 80 ? "#12b76a" : p >= 40 ? "#3538cd" : "#f79009");

export function buildAuditReportHtml(input: AuditReportInput): string {
  const kpi = (v: string, l: string, c: string) =>
    `<div class="kpi"><div class="kv" style="color:${c}">${v}</div><div class="kl">${l}</div></div>`;
  const kpis = [
    kpi(`${input.readyPct}%`, "Audit-readiness", "#101828"),
    kpi(esc(input.stateLabel), "Status", "#12b76a"),
    kpi(esc(input.estDate), "Est. audit-klar", "#101828"),
    kpi(`${input.dcPct}%`, "Dokumenter klar", "#101828"),
    kpi(String(input.blocking.length), "Kritiske/høje åbne", "#b42318"),
  ].join("");

  const blockRows = input.blocking.length
    ? input.blocking
        .map(
          (a) => `<tr>
      <td class="mono">${esc(a.ref)}</td>
      <td>${esc(a.action)}</td>
      <td>${esc(a.owner)}</td>
      <td><span class="pill" style="color:${PRIO_COL[a.priority] ?? "#475467"};border-color:${PRIO_COL[a.priority] ?? "#d0d5dd"}44">${esc(a.priority)}</span></td>
      <td style="${a.overdue ? "color:#b42318;font-weight:600" : "color:#667085"}">${esc(a.target || "—")}${a.overdue ? " · overskredet" : ""}</td>
      <td>${esc(a.status)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="6" style="color:#12b76a;text-align:center;padding:16px">Ingen åbne kritiske eller høje punkter — alt er startet og inden for måldato.</td></tr>`;

  const fwHtml = input.fwRoll
    .map(
      (f) => `<div class="fw">
      <div class="fwtop"><span>${esc(f.short)}</span><span class="mono">${f.done}/${f.n} · ${f.pct}%</span></div>
      <div class="track"><div class="fill" style="width:${f.pct}%;background:${barCol(f.pct)}"></div></div></div>`,
    )
    .join("");

  const docRows = input.documents
    .map((d) => {
      const sig = d.approverName
        ? `Godkendt · ${d.approverName}`
        : d.docStage === "Published"
          ? "Publiceret"
          : d.reviewerName
            ? `Reviewet · ${d.reviewerName}`
            : "Afventer sign-off";
      const col = STAGE_COL[d.docStage] ?? "#475467";
      return `<tr>
        <td class="mono">D-${esc(d.num)}</td>
        <td>${esc(d.title)}</td>
        <td>${esc(d.type)}</td>
        <td class="mono">v${esc(d.version)}</td>
        <td><span class="pill" style="color:${col};border-color:${col}44">${esc(STAGE_DA[d.docStage] ?? d.docStage)}</span></td>
        <td>${esc(sig)}</td></tr>`;
    })
    .join("");

  const polRow = `<div class="polbar">
      <div><span class="pk">Politik</span> Informationssikkerhedspolitik</div>
      <div><span class="pk">Status</span> ${esc(input.policyStatus || "—")}</div>
      <div><span class="pk">Version</span> <span class="mono">${esc(input.policyVersion || "—")}</span></div>
      <div><span class="pk">Ejer</span> ${esc(input.policyOwner || "—")}</div>
      <div><span class="pk">Sektioner</span> ${input.policySectionCount}</div>
      <div><span class="pk">Næste review</span> ${esc(input.policyNextReview || "—")}</div>
    </div>`;

  const summary =
    `Pr. ${esc(input.today)} er ${esc(input.orgName)} <b>${input.readyPct}%</b> klar til audit på tværs af handlings- og dokumentplan, med status <b>${esc(input.stateLabel.toLowerCase())}</b> og estimeret audit-klar <b>${esc(input.estDate)}</b>. ` +
    (input.blocking.length
      ? `Der er <b style="color:#b42318">${input.blocking.length}</b> kritiske/høje punkter der ikke er startet eller har overskredet måldato — disse bør prioriteres først. `
      : `Ingen kritiske eller høje punkter er blokerende lige nu. `) +
    `<b>${input.dcPct}%</b> af de kontrollerede dokumenter er publiceret eller godkendt.`;

  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><title>ComplyKit — ${esc(input.orgName)} — ISMS-status</title>
<style>
  @page{ size:A4; margin:16mm 14mm; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{ font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; color:#101828; font-size:11px; line-height:1.5; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .mono{ font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace; }
  .wrap{ max-width:720px; margin:0 auto; }
  .cover{ background:#101828; color:#fff; border-radius:14px; padding:26px 28px; margin-bottom:22px; }
  .brand{ display:flex; align-items:center; gap:9px; margin-bottom:20px; }
  .logo{ width:26px; height:26px; border-radius:7px; background:#12b76a; color:#06281a; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:14px; }
  .brand .bn{ font-weight:600; font-size:14px; letter-spacing:-.2px; }
  .eyebrow{ font-size:9.5px; letter-spacing:1.4px; text-transform:uppercase; color:#8a93a3; font-weight:600; margin-bottom:8px; }
  .cover h1{ font-size:22px; font-weight:700; margin:0 0 6px; letter-spacing:-.4px; }
  .cover .sub{ font-size:11.5px; color:#c3c9d4; }
  .kpis{ display:flex; gap:10px; margin-bottom:24px; }
  .kpi{ flex:1; background:#f6f7f9; border:1px solid #eef0f3; border-radius:10px; padding:12px 12px; }
  .kv{ font-size:19px; font-weight:700; letter-spacing:-.4px; line-height:1.1; }
  .kl{ font-size:9px; color:#667085; margin-top:4px; text-transform:uppercase; letter-spacing:.4px; }
  section{ margin-bottom:22px; break-inside:avoid; }
  h2{ font-size:12.5px; font-weight:700; margin:0 0 4px; letter-spacing:-.2px; }
  .lead{ font-size:10.5px; color:#98a2b3; margin:0 0 12px; }
  .summary{ font-size:11.5px; line-height:1.65; color:#344054; background:#fbfbfc; border:1px solid #eaecf0; border-left:3px solid #3538cd; border-radius:8px; padding:14px 16px; }
  table{ width:100%; border-collapse:collapse; font-size:10px; }
  th{ text-align:left; font-size:8.5px; text-transform:uppercase; letter-spacing:.4px; color:#98a2b3; font-weight:600; padding:0 8px 6px; border-bottom:1px solid #eaecf0; }
  td{ padding:7px 8px; border-bottom:1px solid #f2f4f7; vertical-align:top; color:#344054; }
  .pill{ display:inline-block; font-size:8.5px; font-weight:600; padding:1px 7px; border-radius:20px; border:1px solid; }
  .fwgrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px 22px; }
  .fw .fwtop{ display:flex; justify-content:space-between; font-size:10px; color:#475467; margin-bottom:4px; }
  .fw .fwtop .mono{ color:#98a2b3; }
  .track{ height:7px; border-radius:5px; background:#eef0f3; overflow:hidden; }
  .fill{ height:100%; border-radius:5px; }
  .polbar{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px 18px; font-size:10.5px; color:#344054; background:#fbfbfc; border:1px solid #eaecf0; border-radius:8px; padding:14px 16px; margin-bottom:12px; }
  .pk{ display:block; font-size:8.5px; text-transform:uppercase; letter-spacing:.4px; color:#98a2b3; font-weight:600; margin-bottom:2px; }
  .foot{ margin-top:26px; padding-top:12px; border-top:1px solid #eaecf0; font-size:8.5px; color:#98a2b3; line-height:1.55; }
</style></head><body><div class="wrap">
  <div class="cover">
    <div class="brand"><div class="logo">C</div><div class="bn">ComplyKit</div></div>
    <div class="eyebrow">Bestyrelses- / audit-pakke</div>
    <h1>${esc(input.orgName)}</h1>
    <div class="sub">Informationssikkerhed (ISMS) · statusrapport genereret ${esc(input.today)}</div>
  </div>

  <div class="kpis">${kpis}</div>

  <section>
    <h2>Ledelsesresumé</h2>
    <div class="lead">Audit-readiness og estimeret klar-dato</div>
    <div class="summary">${summary}</div>
  </section>

  <section>
    <h2>Åbne kritiske &amp; høje punkter</h2>
    <div class="lead">Ikke startet eller overskredet måldato — prioriteres først</div>
    <table><thead><tr><th>Ref</th><th>Aktivitet</th><th>Ejer</th><th>Prioritet</th><th>Måldato</th><th>Status</th></tr></thead><tbody>${blockRows}</tbody></table>
  </section>

  <section>
    <h2>Readiness pr. rammeværk</h2>
    <div class="lead">ISO 27001, NIS2 m.fl.</div>
    <div class="fwgrid">${fwHtml}</div>
  </section>

  <section>
    <h2>Dokument- &amp; politikstatus</h2>
    <div class="lead">Versioner og godkendelser</div>
    ${polRow}
    <table><thead><tr><th>Dok</th><th>Titel</th><th>Type</th><th>Version</th><th>Status</th><th>Sign-off</th></tr></thead><tbody>${docRows}</tbody></table>
  </section>

  <div class="foot">Genereret af ComplyKit · ${esc(input.today)}. ComplyKit understøtter alignment med de nævnte standarder. Organisationen bør ikke fremstå som certificeret, medmindre certificering er selvstændigt og eksplicit opnået.</div>
</div></body></html>`;
}

export function openAndPrintReport(html: string): void {
  let w: Window | null = null;
  try {
    w = window.open("", "_blank");
  } catch {
    w = null;
  }
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
    const go = () => {
      try {
        w!.focus();
        w!.print();
      } catch {
        /* ignore */
      }
    };
    w.onload = go;
    setTimeout(go, 700);
    return;
  }
  const f = document.createElement("iframe");
  f.setAttribute("style", "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0");
  document.body.appendChild(f);
  const d = f.contentWindow?.document;
  if (!d) return;
  d.open();
  d.write(html);
  d.close();
  setTimeout(() => {
    try {
      f.contentWindow?.focus();
      f.contentWindow?.print();
    } catch {
      /* ignore */
    }
  }, 600);
}

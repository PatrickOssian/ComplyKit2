import Link from "next/link";
import { AuditPackageCard } from "@/components/dashboard/AuditPackageCard";
import { ReadinessHero } from "@/components/dashboard/ReadinessHero";
import { PageShell } from "@/components/shell/PageShell";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { requireAppContext } from "@/lib/app-context";
import { advisorActivity, frameworks as allFrameworks, policyMeta, roadmapPhases } from "@/lib/data/seed";
import type { ActivityStatus, Phase, Priority } from "@/lib/data/types";
import {
  estAuditReady,
  estToMonthInputValue,
  formatDkDate,
  isDocDone,
  isDone,
  isOverdue,
  prioMeta,
  readinessState,
  statusMeta,
} from "@/lib/domain";
import type { AuditReportInput } from "@/lib/reports/audit-report";

const TIME_DK: Record<string, string> = {
  "Weeks 0–2": "Uge 0–2",
  "Months 0–3": "Måned 0–3",
  "Months 3–6": "Måned 3–6",
  "Months 6–12": "Måned 6–12",
};

export default async function DashboardPage() {
  const { session, advisor, bucket } = await requireAppContext();

  const ap = bucket.activities.filter((a) => session.gxp || !a.gxp);
  const dc = bucket.documents.filter((d) => session.gxp || !d.gxp);

  const apDone = ap.filter(isDone).length;
  const apPct = ap.length ? Math.round((apDone / ap.length) * 100) : 0;
  const dcDone = dc.filter(isDocDone).length;
  const dcPct = dc.length ? Math.round((dcDone / dc.length) * 100) : 0;

  const totDone = apDone + dcDone;
  const totAll = ap.length + dc.length;
  const readyPct = totAll ? Math.round((totDone / totAll) * 100) : 0;
  const rs = readinessState(readyPct);
  const estDate = estAuditReady(policyMeta.validFrom, bucket.estDateOverride);
  const estMonthValue = estToMonthInputValue(estDate);

  const fwList = allFrameworks.filter((f) => session.gxp || !f.gxp);
  const fwRoll = fwList.map((f) => {
    const rows = ap.filter((a) => a.frameworks.includes(f.key));
    const n = rows.length;
    const done = rows.filter(isDone).length;
    const pct = n ? Math.round((done / n) * 100) : 0;
    return { key: f.key, short: f.short, done, n, pct };
  });

  const blocking = ap.filter(
    (a) => (a.priority === "Critical" || a.priority === "High") && (a.status === "Not started" || isOverdue(a)),
  );
  const blockingRows = blocking.slice(0, 6).map((a) => ({ ...a, overdue: isOverdue(a) }));

  const jStats = roadmapPhases.map((p) => {
    const rows = ap.filter((a) => a.phase === p.phase);
    const n = rows.length;
    const done = rows.filter(isDone).length;
    return { p, n, done, complete: n > 0 && done === n };
  });
  let hereIdx = jStats.findIndex((x) => !x.complete);
  if (hereIdx < 0) hereIdx = jStats.length - 1;

  const statuses: ActivityStatus[] = ["Implemented", "Approved plan", "In progress", "Not started", "Deferred", "N/A"];
  const statusSeg = statuses
    .map((s) => {
      const n = ap.filter((a) => a.status === s).length;
      const m = statusMeta(s);
      return { label: s, n, dot: m.dot };
    })
    .filter((x) => x.n > 0);

  const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
  const prioRows = priorities
    .map((p) => {
      const rows = ap.filter((a) => a.priority === p);
      const n = rows.length;
      const done = rows.filter(isDone).length;
      return { label: p, n, done, bar: prioMeta(p).bar };
    })
    .filter((x) => x.n > 0);

  const phases: Phase[] = ["Phase 0", "Phase 1", "Phase 2", "Phase 3"];
  const phaseTime: Record<Phase, string> = {
    "Phase 0": "Weeks 0–2",
    "Phase 1": "Months 0–3",
    "Phase 2": "Months 3–6",
    "Phase 3": "Months 6–12",
  };
  const phaseRows = phases.map((p) => {
    const rows = ap.filter((a) => a.phase === p);
    const n = rows.length;
    const done = rows.filter(isDone).length;
    return { label: p, time: phaseTime[p], n, done };
  });

  const reportInput: AuditReportInput = {
    orgName: policyMeta.org,
    today: formatDkDate(new Date()),
    readyPct,
    stateLabel: rs.label,
    estDate,
    dcPct,
    blocking: blocking.map((a) => ({
      ref: a.ref,
      action: a.action,
      owner: a.owner,
      priority: a.priority,
      target: a.target,
      status: a.status,
      overdue: isOverdue(a),
    })),
    fwRoll,
    policyStatus: policyMeta.policyStatus,
    policyVersion: bucket.policyState.version,
    policyOwner: bucket.policyState.owner,
    policyNextReview: policyMeta.nextReview,
    policySectionCount: bucket.policySections.filter((p) => session.gxp || !p.gxp).length,
    documents: dc.map((d) => ({
      num: d.num,
      title: d.title,
      type: d.type,
      version: d.version,
      docStage: d.docStage,
      approverName: d.approveSig?.name ?? null,
      reviewerName: d.reviewSig?.name ?? null,
    })),
  };

  return (
    <PageShell
      title="Overblik"
      subtitle="Live status fra handlings- og dokumentplan"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1180px]">
        <ReadinessHero
          pct={readyPct}
          stateLabel={rs.label}
          color={rs.color}
          bg={rs.bg}
          estDate={estDate}
          estMonthValue={estMonthValue}
        />
        <div className="text-[11px] text-ck-muted-2 bg-white border border-ck-border rounded-lg px-3.5 py-2.5 mb-5">
          Bygget til life science — GxP · EU GMP Annex 11 / 21 CFR Part 11 · rådgivning i loopet · EU-hosting. Ikke et
          generisk GRC-værktøj.
        </div>

        {/* 3 buyer panels */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="text-[13px] font-semibold text-ck-ink mb-0.5">Er vi klar?</div>
            <div className="text-[11px] text-ck-muted mb-3.5">Readiness pr. rammeværk</div>
            {fwRoll.map((f) => (
              <Link key={f.key} href="/standards" className="block mb-3">
                <div className="flex justify-between text-xs text-ck-text-2 mb-1.5">
                  <span className="font-medium">{f.short}</span>
                  <span className="text-ck-muted">
                    {f.done} / {f.n} · {f.pct}%
                  </span>
                </div>
                <div className="h-1.75 bg-[#f2f4f7] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${f.pct}%`, background: f.pct >= 80 ? "#12b76a" : f.pct >= 40 ? "#3538cd" : "#f79009" }}
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="text-[13px] font-semibold text-ck-ink">Hvad haster nu</div>
              <span className="text-[10.5px] font-semibold text-[#b42318] bg-ck-red-bg border border-ck-red-border px-1.75 py-0.5 rounded-full">
                {blocking.length}
              </span>
            </div>
            <div className="text-[11px] text-ck-muted mb-3">
              Kritiske/høje der ikke er startet eller har overskredet måldato.
            </div>
            {blockingRows.map((b) => (
              <Link
                key={b.ref}
                href="/actions"
                className="grid grid-cols-[1fr_auto] gap-2 items-start py-2.25 border-t border-[#f2f4f7] text-xs"
              >
                <div className="min-w-0">
                  <div className="text-ck-ink font-medium leading-snug">{b.action}</div>
                  <div className="text-[10.5px] text-ck-muted mt-0.5">
                    {b.ref} · {b.owner}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[11px] ${b.overdue ? "text-[#b42318] font-semibold" : "text-ck-muted"}`}>
                    {b.target || "—"}
                  </div>
                  {b.overdue && <div className="text-[9.5px] font-semibold text-[#b42318] mt-0.5">Overskredet</div>}
                </div>
              </Link>
            ))}
          </div>

          <AuditPackageCard orgName={policyMeta.org} estDate={estDate} reportInput={reportInput} />
        </div>

        {/* journey */}
        <div className="bg-white border border-ck-border rounded-xl px-5.5 pt-4.5 pb-5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[13px] font-semibold text-ck-ink">Vejen til audit-klar</div>
            <div className="text-[11.5px] text-ck-muted">
              Dag 1: klon skabelon → estimeret audit-klar <b className="text-ck-text-2 font-semibold">{estDate}</b>
            </div>
          </div>
          <div className="flex items-start">
            {jStats.map((x, i) => {
              const here = i === hereIdx;
              const done = x.complete;
              const c = done ? "#12b76a" : here ? "#3538cd" : "#d0d5dd";
              const leftDone = i > 0 && jStats[i - 1].complete;
              const rightDone = done;
              return (
                <div key={x.p.phase} className="flex-1 min-w-0 flex flex-col items-center gap-2.25">
                  <div className="flex items-center w-full">
                    <div
                      className={`flex-1 h-[3px] rounded ${i === 0 ? "invisible" : ""}`}
                      style={{ background: leftDone ? "#12b76a" : "#e4e7ec" }}
                    />
                    <div
                      className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: c, boxShadow: here ? "0 0 0 4px rgba(53,56,205,.15)" : undefined }}
                    >
                      {done ? "✓" : i}
                    </div>
                    <div
                      className={`flex-1 h-[3px] rounded ${i === jStats.length - 1 ? "invisible" : ""}`}
                      style={{ background: rightDone ? "#12b76a" : "#e4e7ec" }}
                    />
                  </div>
                  <div className="text-center px-1.5">
                    <div
                      className={`text-xs leading-tight ${here ? "font-semibold" : "font-medium"}`}
                      style={{ color: here ? "#101828" : done ? "#12b76a" : "#98a2b3" }}
                    >
                      {x.p.name}
                    </div>
                    <div className="text-[10px] text-ck-muted mt-0.5">{TIME_DK[x.p.time] ?? x.p.time}</div>
                    {here && (
                      <div className="inline-block mt-1.5 text-[9.5px] font-semibold text-ck-indigo bg-ck-indigo-bg border border-ck-indigo-border px-2 py-0.5 rounded-full">
                        I er her
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* advisor card */}
        <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-3.25 mb-3.5">
            <div className="w-10 h-10 rounded-full shrink-0 bg-ck-indigo-bg text-ck-indigo text-[13px] font-semibold flex items-center justify-center">
              {advisor.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ck-ink">
                Din rådgiver: {advisor.firm} · {advisor.name}
              </div>
              <div className="text-[11.5px] text-ck-muted">
                {advisor.role} · næste review {advisor.nextReview}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-ck-accent bg-ck-accent-bg border border-ck-accent-border px-2.25 py-0.75 rounded-full">
              Aktiv
            </span>
          </div>
          <div className="border-t border-[#f2f4f7] pt-3">
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-2.5">
              Rådgiver-aktivitet
            </div>
            <div className="flex flex-col gap-2.25">
              {advisorActivity.map((e) => (
                <div key={e.when} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-ck-indigo shrink-0 mt-1.5" />
                  <div className="flex-1 text-xs text-ck-text-2 leading-relaxed">{e.text}</div>
                  <div className="text-[10.5px] text-ck-muted whitespace-nowrap shrink-0">{e.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* detailed status */}
        <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-3">Detaljeret status</div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 flex items-center gap-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <ProgressRing pct={apPct} size={72} strokeWidth={8} trackColor="#eaecf0" progressColor="#12b76a" />
            <div>
              <div className="text-xs text-ck-muted-2">Handlingsplan</div>
              <div className="text-[30px] font-bold text-ck-ink tracking-tight leading-tight">{apPct}%</div>
              <div className="text-xs text-ck-muted">
                {apDone} af {ap.length} implementeret / godkendt
              </div>
            </div>
          </div>
          <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 flex items-center gap-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <ProgressRing pct={dcPct} size={72} strokeWidth={8} trackColor="#eaecf0" progressColor="#2e90fa" />
            <div>
              <div className="text-xs text-ck-muted-2">Dokumentplan</div>
              <div className="text-[30px] font-bold text-ck-ink tracking-tight leading-tight">{dcPct}%</div>
              <div className="text-xs text-ck-muted">
                {dcDone} af {dc.length} publiceret / godkendt
              </div>
            </div>
          </div>
        </div>

        {/* status distribution */}
        <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[13px] font-semibold text-ck-ink mb-3.5">
            Status — handlingsplan ({ap.length} aktiviteter)
          </div>
          <div className="flex h-3 rounded-md overflow-hidden mb-3.5">
            {statusSeg.map((s) => (
              <div key={s.label} title={s.label} style={{ width: `${(s.n / ap.length) * 100}%`, background: s.dot }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {statusSeg.map((s) => (
              <div key={s.label} className="flex items-center gap-1.75 text-xs text-ck-text-2">
                <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                {s.label}
                <span className="text-ck-ink font-semibold">{s.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* priority + phase */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="text-[13px] font-semibold text-ck-ink mb-3.5">Efter prioritet</div>
            {prioRows.map((p) => (
              <div key={p.label} className="mb-3">
                <div className="flex justify-between text-xs text-ck-text-2 mb-1.5">
                  <span>{p.label}</span>
                  <span className="text-ck-muted">
                    {p.done} / {p.n}
                  </span>
                </div>
                <div className="h-1.75 bg-[#f2f4f7] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${p.n ? (p.done / p.n) * 100 : 0}%`, background: p.bar }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="text-[13px] font-semibold text-ck-ink mb-3.5">Efter fase</div>
            {phaseRows.map((p) => (
              <div key={p.label} className="mb-3">
                <div className="flex justify-between text-xs text-ck-text-2 mb-1.5">
                  <span>
                    {p.label} <span className="text-ck-muted ml-1.5">{p.time}</span>
                  </span>
                  <span className="text-ck-muted">
                    {p.done} / {p.n}
                  </span>
                </div>
                <div className="h-1.75 bg-[#f2f4f7] rounded overflow-hidden">
                  <div
                    className="h-full rounded bg-ck-indigo"
                    style={{ width: `${p.n ? (p.done / p.n) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* blocking table */}
        <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="text-[13px] font-semibold text-ck-ink">Hvad blokerer fremdrift?</div>
            <span className="text-[10.5px] font-semibold text-[#b42318] bg-ck-red-bg border border-ck-red-border px-1.75 py-0.5 rounded-full">
              {blocking.length} kritiske/høje ikke startet
            </span>
          </div>
          <div className="text-[11.5px] text-ck-muted mb-3">
            Critical- og High-aktiviteter med status &quot;Not started&quot; — start disse først.
          </div>
          {blockingRows.map((b) => (
            <Link
              key={b.ref}
              href="/actions"
              className="grid grid-cols-[48px_1fr_150px_88px] gap-2.5 items-center py-2.5 border-t border-[#f2f4f7] text-xs"
            >
              <div className="font-mono text-[11px] text-ck-muted">{b.ref}</div>
              <div className="text-ck-ink font-medium">{b.action}</div>
              <div className="text-ck-muted-2 text-[11.5px]">{b.owner}</div>
              <div>
                <span
                  className="text-[10.5px] font-semibold rounded-full px-2.25 py-0.75"
                  style={{ color: prioMeta(b.priority).fg, background: prioMeta(b.priority).bg }}
                >
                  {b.priority}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-[10.5px] text-ck-muted max-w-[820px] mt-4">
          ComplyKit understøtter alignment med de nævnte standarder. Organisationen bør ikke fremstå som certificeret,
          medmindre certificering er selvstændigt og eksplicit opnået.
        </div>
      </div>
    </PageShell>
  );
}

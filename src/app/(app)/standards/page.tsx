import Link from "next/link";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { disclaimer, frameworks as allFrameworks } from "@/lib/data/seed";
import { isDone, prioMeta, statusMeta } from "@/lib/domain";

interface StandardsPageProps {
  searchParams: Promise<{ fw?: string }>;
}

export default async function StandardsPage({ searchParams }: StandardsPageProps) {
  const sp = await searchParams;
  const { session, advisor, bucket } = await requireAppContext();

  const ap = bucket.activities.filter((a) => session.gxp || !a.gxp);
  const docs = bucket.documents.filter((d) => session.gxp || !d.gxp);
  const frameworks = allFrameworks.filter((f) => session.gxp || !f.gxp);
  const sel = frameworks.find((f) => f.key === sp.fw) ? sp.fw! : frameworks[0].key;

  const cards = frameworks.map((f) => {
    const acts = ap.filter((a) => a.frameworks.includes(f.key));
    const done = acts.filter(isDone).length;
    const dcount = docs.filter((d) => d.frameworks.includes(f.key)).length;
    const pct = acts.length ? Math.round((done / acts.length) * 100) : 0;
    return { ...f, n: acts.length, done, dcount, pct, active: f.key === sel };
  });

  const selF = frameworks.find((f) => f.key === sel)!;
  const selActs = ap.filter((a) => a.frameworks.includes(sel));

  return (
    <PageShell
      title="Standarder"
      subtitle={`Crosswalk · dækning pr. rammeværk${session.gxp ? " · GxP aktiv" : ""}`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="text-xs text-ck-text-2 max-w-[720px] mb-3.5">
          Crosswalk fra seed-data: hver aktivitet er mappet til de rammeværk politikken understøtter. Vælg et
          rammeværk for at se dækning. GxP-rammeværk vises kun når Life science / GxP-profilen er aktiv.
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((f) => (
            <Link
              key={f.key}
              href={`/standards?fw=${encodeURIComponent(f.key)}`}
              className={`block bg-white border rounded-xl px-4 py-3.75 ${f.active ? "border-ck-indigo shadow-[0_0_0_3px_rgba(53,56,205,0.12)]" : "border-ck-border shadow-[0_1px_2px_rgba(16,24,40,0.04)]"}`}
            >
              <div className="flex items-center gap-1.75 mb-1">
                <span className="text-[13px] font-semibold text-ck-ink">{f.short}</span>
                {f.gxp && (
                  <span className="text-[8.5px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1 py-0.5 rounded">
                    GxP
                  </span>
                )}
              </div>
              <div className="text-[10.5px] text-ck-muted leading-snug mb-3 min-h-[29px]">{f.desc}</div>
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-[22px] font-bold text-ck-ink">{f.pct}%</span>
                <span className="text-[11px] text-ck-muted">dækning</span>
              </div>
              <div className="h-1.5 bg-[#f2f4f7] rounded overflow-hidden mb-2">
                <div className="h-full rounded" style={{ width: `${f.pct}%`, background: f.gxp ? "#7a5af8" : "#3538cd" }} />
              </div>
              <div className="text-[10.5px] text-ck-muted">
                {f.done}/{f.n} aktiviteter · {f.dcount} dok.
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.25 mb-3">
          <div className="text-[13px] font-semibold text-ck-ink">{selF.short}</div>
          {selF.gxp && (
            <span className="text-[9.5px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1.5 py-0.5 rounded">
              GxP
            </span>
          )}
          <div className="text-[11.5px] text-ck-muted">
            {selF.desc} · {selActs.length} aktiviteter
          </div>
        </div>
        <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          {selActs.map((a) => {
            const pm = prioMeta(a.priority);
            const sm = statusMeta(a.status);
            return (
              <Link
                key={a.ref}
                href={`/actions?sel=${a.ref}`}
                className="grid grid-cols-[52px_1fr_150px_84px_132px] gap-2 items-center px-4 py-3 border-t border-[#f2f4f7] first:border-t-0 text-xs"
              >
                <div className="font-mono text-[11px] text-ck-muted">{a.ref}</div>
                <div className="text-ck-ink font-medium">{a.action}</div>
                <div className="text-ck-muted-2 text-[11.5px]">{a.owner}</div>
                <div>
                  <span className="text-[10.5px] font-semibold rounded-full px-2.25 py-0.75" style={{ color: pm.fg, background: pm.bg }}>
                    {a.priority}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] rounded-full px-2.5 py-1" style={{ color: sm.fg, background: sm.bg }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                    {a.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-[10.5px] text-ck-muted max-w-[820px] mt-3">
          Fuldt ISO 27001 Annex A-kontrolbibliotek og automatiseret gap-scoring er bevidst udenfor MVP (leveres som
          betalt rådgivningsmodul). {disclaimer}
        </div>
      </div>
    </PageShell>
  );
}

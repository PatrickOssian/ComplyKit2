import { CadenceBadge } from "@/components/roadmap/CadenceBadge";
import { RecurringDrawer } from "@/components/roadmap/RecurringDrawer";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { recurringTemplates, roadmapPhases } from "@/lib/data/seed";
import type { Phase } from "@/lib/data/types";
import { isDone } from "@/lib/domain";

const PHASE_COLORS: Record<Phase, string> = {
  "Phase 0": "#0e9384",
  "Phase 1": "#3538cd",
  "Phase 2": "#7a5af8",
  "Phase 3": "#b54708",
};

interface RoadmapPageProps {
  searchParams: Promise<{ recSel?: string }>;
}

export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const sp = await searchParams;
  const { session, advisor, bucket } = await requireAppContext();

  const ap = bucket.activities.filter((a) => session.gxp || !a.gxp);
  const phases = roadmapPhases.map((p) => {
    const rows = ap.filter((a) => a.phase === p.phase);
    const n = rows.length;
    const done = rows.filter(isDone).length;
    const pct = n ? Math.round((done / n) * 100) : 0;
    return { ...p, n, done, pct, color: PHASE_COLORS[p.phase] };
  });

  const selected = sp.recSel ? bucket.recurringControls.find((r) => r.control === sp.recSel) : undefined;
  const selectedTemplate = selected ? recurringTemplates[selected.control] : undefined;

  return (
    <PageShell
      title="Roadmap & tilbagevendende kontroller"
      subtitle="Faser 0–3 og kalender for gentagne kontroller"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="grid grid-cols-4 gap-3.5 mb-6">
          {phases.map((p) => (
            <div key={p.phase} className="bg-white border border-ck-border rounded-xl px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-center gap-2 mb-0.75">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-[13px] font-semibold text-ck-ink">{p.phase}</span>
              </div>
              <div className="text-xs text-ck-ink font-medium">{p.name}</div>
              <div className="text-[11px] text-ck-muted mb-3">{p.time}</div>
              <div className="flex justify-between text-[11px] text-ck-text-2 mb-1.25">
                <span>{p.pct}% færdig</span>
                <span className="text-ck-muted">
                  {p.done} / {p.n}
                </span>
              </div>
              <div className="h-1.75 bg-[#f2f4f7] rounded overflow-hidden mb-3">
                <div className="h-full rounded" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
              <div className="text-[11px] text-ck-text-2 leading-relaxed mb-2.5">{p.focus}</div>
              <div className="text-[10.5px] text-ck-muted leading-relaxed border-t border-[#f2f4f7] pt-2.25">
                <span className="text-ck-muted-2 font-semibold">Exit:</span> {p.exit}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[13px] font-semibold text-ck-ink mb-3">Tilbagevendende kontroller</div>
        <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          {bucket.recurringControls.map((r) => {
            const done = !!r.lastDone;
            return (
              <a
                key={r.control}
                href={`/roadmap?recSel=${encodeURIComponent(r.control)}`}
                className="flex items-center gap-3.5 px-4.5 py-3 border-t border-[#f2f4f7] first:border-t-0 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-ck-ink font-medium">{r.control}</div>
                  {r.lastDone && <div className="text-[10.5px] text-ck-accent mt-0.5">✓ Udført {r.lastDone}</div>}
                </div>
                <CadenceBadge control={r.control} cadence={r.cadence} />
                <div className="text-ck-muted-2 w-[150px] truncate">{r.owner}</div>
                <div className="text-ck-muted-2 font-mono text-[11px] w-[70px]">{r.policyRef}</div>
                <div className="text-ck-muted text-[11px] w-[96px]">{r.next}</div>
                <span
                  className={`text-[11px] font-medium rounded-lg px-2.75 py-1.25 whitespace-nowrap ${
                    done ? "text-[#067647] bg-ck-accent-bg border border-ck-accent-border" : "text-ck-indigo bg-ck-indigo-bg border border-ck-indigo-border"
                  }`}
                >
                  {done ? "Opdatér" : "Marker udført"}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {selected && selectedTemplate && (
        <RecurringDrawer
          control={selected.control}
          cadence={selected.cadence}
          owner={selected.owner}
          policyRef={selected.policyRef}
          next={selected.next}
          lastDone={selected.lastDone ?? null}
          historyCount={selected.history?.length ?? 0}
          template={selectedTemplate}
          form={selected.form ?? {}}
        />
      )}
    </PageShell>
  );
}

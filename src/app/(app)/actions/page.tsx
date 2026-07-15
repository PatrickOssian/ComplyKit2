import Link from "next/link";
import { ActivityDrawer } from "@/components/actions/ActivityDrawer";
import { ActivityRow } from "@/components/actions/ActivityRow";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import type { Activity, Priority } from "@/lib/data/types";
import { OWNER_ROLES, isDone } from "@/lib/domain";

const PRIO_FILTERS = ["Alle", "Critical", "High", "Medium", "Low"] as const;
const STATUS_FILTERS = ["Alle", "Not started", "In progress", "Implemented", "Approved plan"] as const;

const PRIO_BUCKETS: { key: Priority; label: string; dot: string }[] = [
  { key: "Critical", label: "Critical — do first", dot: "#f04438" },
  { key: "High", label: "High priority — next", dot: "#f79009" },
  { key: "Medium", label: "Medium priority", dot: "#3538cd" },
  { key: "Low", label: "Low priority", dot: "#98a2b3" },
];

interface ActionsPageProps {
  searchParams: Promise<{ prio?: string; status?: string; owner?: string; sel?: string; showImplemented?: string }>;
}

function buildHref(base: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v && v !== "Alle") params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/actions?${qs}` : "/actions";
}

export default async function ActionsPage({ searchParams }: ActionsPageProps) {
  const sp = await searchParams;
  const { session, advisor, bucket } = await requireAppContext();

  const prio = sp.prio ?? "Alle";
  const statusFilter = sp.status ?? "Alle";
  const owner = sp.owner ?? "Alle";
  const showImplemented = sp.showImplemented === "1";

  const scoped = bucket.activities.filter((a) => session.gxp || !a.gxp);

  const vis = scoped.filter(
    (a) =>
      (prio === "Alle" || a.priority === prio) &&
      (statusFilter === "Alle" || a.status === statusFilter) &&
      (owner === "Alle" || a.owner.includes(owner)),
  );

  const notDone = vis.filter((a) => !isDone(a));
  const doneItems = vis.filter(isDone);

  const groups: { area: string; dot: string; isGxp: boolean; rows: Activity[]; collapsible: boolean }[] = [];
  for (const b of PRIO_BUCKETS) {
    const items = notDone.filter((a) => a.priority === b.key);
    if (items.length) {
      groups.push({ area: b.label, dot: b.dot, isGxp: items.some((a) => a.gxp), rows: items, collapsible: false });
    }
  }
  if (doneItems.length) {
    groups.push({
      area: "Implemented",
      dot: "#12b76a",
      isGxp: false,
      rows: showImplemented ? doneItems : [],
      collapsible: true,
    });
  }

  const selected = sp.sel ? bucket.activities.find((a) => a.ref === sp.sel) : undefined;

  const filterBase = { prio: sp.prio, status: sp.status, owner: sp.owner };

  return (
    <PageShell
      title="Handlingsplan"
      subtitle={`Appendix A · ${scoped.length} aktiviteter`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[11px] text-ck-muted mr-0.5">Prioritet</span>
          {PRIO_FILTERS.map((p) => {
            const active = prio === p;
            const n = p === "Alle" ? scoped.length : scoped.filter((a) => a.priority === p).length;
            return (
              <Link
                key={p}
                href={buildHref({ ...filterBase, prio: p === "Alle" ? undefined : p })}
                className={`text-xs px-2.75 py-1.5 rounded-lg border ${active ? "border-ck-ink bg-ck-ink text-white" : "border-ck-border bg-white text-ck-text-2"}`}
              >
                {p} · {n}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <span className="text-[11px] text-ck-muted mr-0.5">Status</span>
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s;
            return (
              <Link
                key={s}
                href={buildHref({ ...filterBase, status: s === "Alle" ? undefined : s })}
                className={`text-xs px-2.75 py-1.5 rounded-lg border ${active ? "border-ck-ink bg-ck-ink text-white" : "border-ck-border bg-white text-ck-text-2"}`}
              >
                {s}
              </Link>
            );
          })}
          <form action="/actions" method="get" className="ml-1.5">
            <select
              name="owner"
              defaultValue={owner}
              className="text-xs text-ck-text-2 bg-white border border-ck-border px-2.5 py-1.5 rounded-lg"
            >
              <option value="Alle">Alle ejere</option>
              {OWNER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </form>
          <div className="ml-auto text-xs text-ck-muted">{vis.length} vist</div>
        </div>

        {groups.map((g) => (
          <div key={g.area} className="mb-4.5">
            <div className="flex items-center gap-2.25 mb-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: g.dot }} />
              <div className="text-xs font-semibold text-ck-ink">{g.area}</div>
              {g.isGxp && (
                <span className="text-[9.5px] font-semibold tracking-wide uppercase text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1.5 py-0.5 rounded">
                  GxP
                </span>
              )}
              <div className="text-[11px] text-ck-muted">
                {g.area === "Implemented" ? doneItems.length : g.rows.length}{" "}
                {(g.area === "Implemented" ? doneItems.length : g.rows.length) === 1 ? "aktivitet" : "aktiviteter"}
              </div>
              <div className="flex-1 h-px bg-ck-border" />
              {g.collapsible && (
                <Link
                  href={buildHref({ ...filterBase, showImplemented: showImplemented ? undefined : "1" })}
                  className="text-[11px] text-ck-indigo font-medium whitespace-nowrap"
                >
                  {showImplemented ? "Skjul ▴" : "Vis ▾"}
                </Link>
              )}
            </div>
            {g.rows.length > 0 && (
              <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                {g.rows.map((a) => (
                  <ActivityRow key={a.ref} activity={a} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <ActivityDrawer
          activity={selected}
          advNote={bucket.advNotes[selected.ref] ?? ""}
          advisorInitials={advisor.initials}
          advisorName={advisor.name}
          ownerOptions={OWNER_ROLES}
        />
      )}
    </PageShell>
  );
}

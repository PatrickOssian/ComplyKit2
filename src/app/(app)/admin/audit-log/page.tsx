import Link from "next/link";
import { ExportAuditModal } from "@/components/admin/ExportAuditModal";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { auditActionColor, auditCategory } from "@/lib/domain";

const CATEGORIES = ["All events", "E-signatures", "Documents", "Members", "Access", "Billing"];

interface AuditLogPageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function AdminAuditLogPage({ searchParams }: AuditLogPageProps) {
  const sp = await searchParams;
  const { session, advisor, bucket } = await requireAppContext();

  const cat = sp.cat ?? "All events";
  const filtered = cat === "All events" ? bucket.auditLog : bucket.auditLog.filter((e) => auditCategory(e.action) === cat);

  return (
    <PageShell title="Audit-log" subtitle="Uforanderlig, manipulationssikker hændelseslog" gxpOn={session.gxp} advisor={advisor}>
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="flex items-center gap-2.5 text-xs text-ck-text-2 bg-white border border-ck-border rounded-lg px-3.5 py-2.75 mb-4">
          Records are append-only (WORM) and tamper-evident — each entry seals the previous one.
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/admin/audit-log?cat=${encodeURIComponent(c)}`}
              className={`text-xs px-2.75 py-1.5 rounded-lg border ${c === cat ? "border-ck-ink bg-ck-ink text-white" : "border-ck-border bg-white text-ck-text-2"}`}
            >
              {c}
            </Link>
          ))}
          <div className="ml-auto">
            <ExportAuditModal rows={bucket.auditLog} />
          </div>
        </div>

        <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="grid grid-cols-[150px_130px_150px_1fr_110px_100px] gap-2 px-4 py-2.75 text-[10px] tracking-wide uppercase text-ck-muted bg-[#fafafa] border-b border-ck-border">
            <div>Timestamp</div>
            <div>Actor</div>
            <div>Event</div>
            <div>Target</div>
            <div>Source IP</div>
            <div>Seal-hash</div>
          </div>
          {filtered.map((e, i) => {
            const c = auditActionColor(e.action);
            return (
              <div key={i} className="grid grid-cols-[150px_130px_150px_1fr_110px_100px] gap-2 items-center px-4 py-2.75 border-t border-[#f2f4f7] text-[11.5px] font-mono">
                <div className="text-ck-muted-2">{e.time}</div>
                <div className="text-ck-ink font-sans">{e.actor}</div>
                <div>
                  <span className="text-[10.5px] font-medium px-1.75 py-0.75 rounded whitespace-nowrap" style={{ color: c.fg, background: c.bg }}>
                    {e.action}
                  </span>
                </div>
                <div className="text-ck-text-2 font-sans truncate">{e.target}</div>
                <div className="text-ck-muted">{e.ip}</div>
                <div className="text-ck-muted">{e.hash}</div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="px-4 py-6 text-center text-xs text-ck-muted">Ingen hændelser</div>}
        </div>
      </div>
    </PageShell>
  );
}

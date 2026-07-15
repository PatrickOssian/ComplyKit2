import { MembersTable } from "@/components/admin/MembersTable";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { ROLES, roleMeta } from "@/lib/domain";

export default async function AdminMembersPage() {
  const { session, advisor, bucket } = await requireAppContext();

  const roleCards = ROLES.map((r) => {
    const m = roleMeta(r);
    const count = bucket.members.filter((mem) => mem.role === r).length;
    return { role: r, desc: m.desc, dot: m.dot, count };
  });

  return (
    <PageShell
      title="Medlemmer & roller"
      subtitle={`Rollebaseret adgang · ${bucket.members.length} medlemmer`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1160px]">
        <div className="grid grid-cols-4 gap-3 mb-4.5">
          {roleCards.map((r) => (
            <div key={r.role} className="bg-white border border-ck-border rounded-xl px-3.75 py-3.25 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.25 h-2.25 rounded-full" style={{ background: r.dot }} />
                <span className="text-[13px] font-semibold text-ck-ink">{r.role}</span>
                <span className="ml-auto text-[11px] text-ck-muted">{r.count}</span>
              </div>
              <div className="text-[11px] text-ck-text-2 leading-relaxed">{r.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 text-xs text-ck-text-2 bg-white border border-ck-border rounded-lg px-3.5 py-2.75 mb-4">
          Members are synced from your Entra ID directory via SCIM.{" "}
          <span className="text-ck-indigo font-medium">Configure mapping →</span>
        </div>

        <MembersTable members={bucket.members} />
      </div>
    </PageShell>
  );
}

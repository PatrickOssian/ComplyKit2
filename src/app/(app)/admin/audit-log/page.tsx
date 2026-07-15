import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function AdminAuditLogPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Audit-log"
      subtitle="Uforanderlig, manipulationssikker hændelseslog"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Audit-log — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

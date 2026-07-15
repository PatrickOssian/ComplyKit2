import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function ActionsPage() {
  const { session, advisor, bucket } = await requireAppContext();
  const count = bucket.activities.filter((a) => session.gxp || !a.gxp).length;

  return (
    <PageShell
      title="Handlingsplan"
      subtitle={`Appendix A · ${count} aktiviteter`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Handlingsplan — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

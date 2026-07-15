import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function StandardsPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Standarder"
      subtitle={`Crosswalk · dækning pr. rammeværk${session.gxp ? " · GxP aktiv" : ""}`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Standarder — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

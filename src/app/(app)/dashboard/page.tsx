import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function DashboardPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Overblik"
      subtitle="Live status fra handlings- og dokumentplan"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Dashboard — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

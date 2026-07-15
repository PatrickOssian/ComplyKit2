import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function SettingsPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Indstillinger"
      subtitle="Workspace-indstillinger og sikkerhed"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Indstillinger — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

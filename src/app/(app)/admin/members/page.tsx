import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function AdminMembersPage() {
  const { session, advisor, bucket } = await requireAppContext();

  return (
    <PageShell
      title="Medlemmer & roller"
      subtitle={`Rollebaseret adgang · ${bucket.members.length} medlemmer`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Medlemmer & roller — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

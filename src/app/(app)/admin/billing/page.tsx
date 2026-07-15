import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function AdminBillingPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Fakturering & abonnement"
      subtitle="Abonnement, betalingsmetode og fakturaer"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Fakturering — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

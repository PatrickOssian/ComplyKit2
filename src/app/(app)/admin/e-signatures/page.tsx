import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function AdminESignaturesPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Elektroniske signaturer"
      subtitle="21 CFR Part 11 · EU GMP Annex 11"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">E-signaturer — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

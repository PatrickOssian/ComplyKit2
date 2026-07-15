import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function DocsPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Dokumentplan"
      subtitle="Appendix B · 12 styrede dokumenter · livscyklus"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Dokumentplan — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

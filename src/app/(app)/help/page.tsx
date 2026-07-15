import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function HelpPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Hjælp & support"
      subtitle="Guides, din rådgiver og hvordan du kontakter os"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Hjælp & support — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

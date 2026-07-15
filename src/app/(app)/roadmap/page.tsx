import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function RoadmapPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell
      title="Roadmap & tilbagevendende kontroller"
      subtitle="Faser 0–3 og kalender for gentagne kontroller"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Roadmap — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

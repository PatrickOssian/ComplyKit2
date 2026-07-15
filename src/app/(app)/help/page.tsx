import { HelpPanel } from "@/components/help/HelpPanel";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { helpGuides } from "@/lib/data/seed";

export default async function HelpPage() {
  const { session, advisor } = await requireAppContext();

  return (
    <PageShell title="Hjælp & support" subtitle="Guides, din rådgiver og hvordan du kontakter os" gxpOn={session.gxp} advisor={advisor}>
      <div className="p-7 pb-12 max-w-[820px]">
        <HelpPanel advisor={advisor} guides={helpGuides} />
      </div>
    </PageShell>
  );
}

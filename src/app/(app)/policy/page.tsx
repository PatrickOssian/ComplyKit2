import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function PolicyPage() {
  const { session, advisor, bucket } = await requireAppContext();
  const count = bucket.policySections.filter((p) => session.gxp || !p.gxp).length;

  return (
    <PageShell
      title="Informationssikkerhedspolitik"
      subtitle={`${count} afsnit${session.gxp ? " · GxP-afsnit synlige" : " · GxP-afsnit skjult"}`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 max-w-[1180px]">
        <p className="text-ck-muted text-sm">Politik — kommer i næste fase.</p>
      </div>
    </PageShell>
  );
}

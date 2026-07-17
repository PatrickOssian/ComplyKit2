import { SideRail } from "@/components/shell/SideRail";
import { requireAppContext } from "@/lib/app-context";
import { isDone } from "@/lib/domain";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, tenant, tenants, bucket, user } = await requireAppContext();

  const scopedActs = bucket.activities.filter((a) => session.gxp || !a.gxp);
  const apPct = scopedActs.length
    ? Math.round((scopedActs.filter(isDone).length / scopedActs.length) * 100)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <SideRail
        tenant={tenant}
        tenants={tenants}
        advisorMode={session.advisorMode}
        gxpOn={session.gxp}
        apPct={apPct}
        pendingCount={bucket.pendingSignatures.length}
        user={user}
        hiddenNavSections={bucket.hiddenNavSections}
      />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}

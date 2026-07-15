import { BillingPanel } from "@/components/admin/BillingPanel";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { planDefs, policyMeta } from "@/lib/data/seed";

export default async function AdminBillingPage() {
  const { session, advisor, bucket } = await requireAppContext();
  const cur = planDefs.find((p) => p.key === bucket.plan) ?? planDefs[1];
  const seatsTotal = bucket.plan === "essentials" ? "5" : bucket.plan === "compliance" ? "25" : "∞";
  const activeMembers = bucket.members.filter((m) => m.status !== "Invited").length;

  return (
    <PageShell
      title="Fakturering & abonnement"
      subtitle="Abonnement, betalingsmetode og fakturaer"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="bg-white border border-ck-border rounded-xl px-5 py-3.75 mb-5 flex items-center gap-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div>
            <div className="text-[11px] text-ck-muted">Nuværende plan</div>
            <div className="text-sm font-semibold text-ck-ink">{cur.name}</div>
          </div>
          <div>
            <div className="text-[11px] text-ck-muted">Pladser</div>
            <div className="text-sm font-semibold text-ck-ink">
              {activeMembers} / {seatsTotal}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ck-muted">Næste faktura</div>
            <div className="text-sm font-semibold text-ck-ink">{bucket.plan === "gxp" ? "Custom" : cur.price}</div>
          </div>
          <span className="ml-auto text-[10.5px] font-semibold text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2.5 py-1 rounded-full">
            Active
          </span>
        </div>

        <BillingPanel orgName={policyMeta.org} plans={planDefs} currentPlan={bucket.plan} invoices={bucket.invoices} />
      </div>
    </PageShell>
  );
}

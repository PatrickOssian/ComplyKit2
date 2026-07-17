import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/platform-context";
import { getAllTenantsForPlatform, getTenantAdvisors, getTenantEstDate } from "@/lib/data/store";

const STATUS_LABEL: Record<string, string> = {
  pending_approval: "Pending approval",
  active: "Active",
  archived: "Archived",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<string, string> = {
  pending_approval: "text-ck-amber bg-ck-amber-bg border-ck-amber-border",
  active: "text-[#067647] bg-ck-accent-bg border-ck-accent-border",
  archived: "text-ck-muted-2 bg-[#f2f4f7] border-ck-border",
  rejected: "text-ck-red bg-ck-red-bg border-ck-red-border",
};

export default async function PlatformTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePlatformAdmin();
  const { status } = await searchParams;

  const allTenants = await getAllTenantsForPlatform();
  const tenants = status ? allTenants.filter((t) => t.status === status) : allTenants;

  const rows = await Promise.all(
    tenants.map(async (t) => ({
      tenant: t,
      estDate: await getTenantEstDate(t.id),
      advisors: await getTenantAdvisors(t.id),
    })),
  );

  const statuses: (string | undefined)[] = [undefined, "pending_approval", "active", "archived", "rejected"];

  return (
    <div>
      <h1 className="text-xl font-semibold text-ck-ink mb-1">Tenants</h1>
      <div className="text-[13px] text-ck-muted mb-5">Every workspace across every customer — {allTenants.length} total.</div>

      <div className="flex items-center gap-2 mb-4">
        {statuses.map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/platform/tenants?status=${s}` : "/platform/tenants"}
            className={`text-[12px] px-3 py-1.5 rounded-full border ${
              status === s ? "bg-ck-ink text-white border-ck-ink" : "text-ck-text-2 bg-white border-ck-border"
            }`}
          >
            {s ? STATUS_LABEL[s] : "All"}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-[2fr_120px_70px_120px_70px_1.5fr_110px] gap-3 px-4 py-2.5 text-[10.5px] uppercase tracking-wide text-ck-muted border-b border-ck-border">
          <div>Organisation</div>
          <div>Status</div>
          <div>GxP</div>
          <div>Target date</div>
          <div>Users</div>
          <div>Advisor(s)</div>
          <div>Created</div>
        </div>
        {rows.map(({ tenant, estDate, advisors }) => (
          <Link
            key={tenant.id}
            href={`/platform/tenants/${tenant.id}`}
            className="grid grid-cols-[2fr_120px_70px_120px_70px_1.5fr_110px] gap-3 px-4 py-3 items-center border-b border-[#f2f4f7] last:border-b-0 hover:bg-[#f9fafb] text-[12.5px] text-ck-ink"
          >
            <div className="font-medium truncate">{tenant.name}</div>
            <div>
              <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[tenant.status]}`}>
                {STATUS_LABEL[tenant.status]}
              </span>
            </div>
            <div>{tenant.gxp ? "On" : "Off"}</div>
            <div className="text-ck-muted">{estDate ?? "—"}</div>
            <div>{tenant.users}</div>
            <div className="text-ck-muted-2 truncate">
              {advisors.length ? advisors.map((a) => a.name).join(", ") : "—"}
            </div>
            <div className="text-ck-muted text-[11.5px]">{new Date(tenant.createdAt).toLocaleDateString("da-DK")}</div>
          </Link>
        ))}
        {rows.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-ck-muted">No tenants match this filter.</div>}
      </div>
    </div>
  );
}

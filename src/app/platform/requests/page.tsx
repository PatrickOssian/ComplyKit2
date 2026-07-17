import Link from "next/link";
import { requirePlatformUser } from "@/lib/platform-context";
import { getTenantRequests } from "@/lib/data/store";

const STATUS_LABEL: Record<string, string> = {
  pending_approval: "Pending approval",
  active: "Approved",
  archived: "Approved (archived)",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<string, string> = {
  pending_approval: "text-ck-amber bg-ck-amber-bg border-ck-amber-border",
  active: "text-[#067647] bg-ck-accent-bg border-ck-accent-border",
  archived: "text-ck-muted-2 bg-[#f2f4f7] border-ck-border",
  rejected: "text-ck-red bg-ck-red-bg border-ck-red-border",
};

export default async function PlatformRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const platformUser = await requirePlatformUser();
  const { created } = await searchParams;

  const requests = await getTenantRequests(
    platformUser.isPlatformAdmin ? {} : { requestedByUserId: platformUser.id },
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-ck-ink mb-1">{platformUser.isPlatformAdmin ? "Requests" : "Mine anmodninger"}</h1>
      <div className="text-[13px] text-ck-muted mb-5">
        {platformUser.isPlatformAdmin
          ? "Alle anmodninger om nye workspaces, uanset status."
          : "Anmodninger om nye workspaces, du selv har sendt."}
      </div>

      {created && (
        <div className="text-[12.5px] text-[#067647] bg-ck-accent-bg border border-ck-accent-border rounded-lg px-3.5 py-2.5 mb-4">
          Anmodningen er registreret.
        </div>
      )}

      <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-[2fr_120px_1fr_110px] gap-3 px-4 py-2.5 text-[10.5px] uppercase tracking-wide text-ck-muted border-b border-ck-border">
          <div>Organisation</div>
          <div>Status</div>
          <div>Admin-email</div>
          <div>Sendt</div>
        </div>
        {requests.map((r) => {
          const row = (
            <div
              key={r.id}
              className="grid grid-cols-[2fr_120px_1fr_110px] gap-3 px-4 py-3 items-center border-b border-[#f2f4f7] last:border-b-0 text-[12.5px] text-ck-ink"
            >
              <div className="font-medium truncate">{r.name}</div>
              <div>
                <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <div className="text-ck-muted truncate">{r.requestedAdminEmail ?? "—"}</div>
              <div className="text-ck-muted text-[11.5px]">{new Date(r.createdAt).toLocaleDateString("da-DK")}</div>
            </div>
          );
          return platformUser.isPlatformAdmin ? (
            <Link key={r.id} href={`/platform/tenants/${r.id}`} className="block hover:bg-[#f9fafb]">
              {row}
            </Link>
          ) : (
            row
          );
        })}
        {requests.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-ck-muted">Ingen anmodninger endnu.</div>
        )}
      </div>
    </div>
  );
}

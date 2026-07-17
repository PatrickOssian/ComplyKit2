import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/platform-context";
import {
  getAllAdvisors,
  getTenant,
  getTenantAdvisors,
  getTenantEstDate,
  getTenantInvites,
} from "@/lib/data/store";
import {
  approveTenantRequestAction,
  archiveTenantAction,
  reassignAdvisorAction,
  rejectTenantRequestAction,
  resendInviteAction,
  revokeInviteAction,
} from "@/lib/platform-actions";

const STANDARDS = ["ISO 27001", "NIS2", "GDPR", "EU GMP Annex 11", "21 CFR Part 11", "GAMP 5", "ALCOA+", "GxP"];

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

const INVITE_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  expired: "Expired / revoked",
};

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;

  const tenant = await getTenant(id);
  if (!tenant) redirect("/platform/tenants");

  const [estDate, advisors, allAdvisors, invites] = await Promise.all([
    getTenantEstDate(id),
    getTenantAdvisors(id),
    getAllAdvisors(),
    getTenantInvites(id),
  ]);

  const assignedAdvisorIds = new Set(advisors.map((a) => a.userId));
  const unassignedAdvisors = allAdvisors.filter((a) => !assignedAdvisorIds.has(a.userId));

  return (
    <div className="max-w-[720px]">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl font-semibold text-ck-ink">{tenant.name}</h1>
        <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[tenant.status]}`}>
          {STATUS_LABEL[tenant.status]}
        </span>
      </div>
      <div className="text-[13px] text-ck-muted mb-6">
        {tenant.sector} · {tenant.gxp ? "GxP-reguleret" : "Ikke GxP"} · Oprettet {new Date(tenant.createdAt).toLocaleDateString("da-DK")}
      </div>

      {tenant.status === "pending_approval" && (
        <div className="grid grid-cols-2 gap-5 mb-6">
          <form
            action={approveTenantRequestAction.bind(null, tenant.id)}
            className="bg-white border border-ck-border rounded-xl p-5 flex flex-col gap-3.5"
          >
            <div className="text-[13px] font-semibold text-ck-ink mb-1">Godkend anmodning</div>

            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Organisationsnavn</div>
              <input
                name="name"
                defaultValue={tenant.name}
                className="w-full border border-ck-border-2 rounded-lg px-3 py-2 text-[13px] text-ck-ink outline-none focus:border-ck-ink"
              />
            </div>
            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Sektor</div>
              <input
                name="sector"
                defaultValue={tenant.sector}
                className="w-full border border-ck-border-2 rounded-lg px-3 py-2 text-[13px] text-ck-ink outline-none focus:border-ck-ink"
              />
            </div>
            <label className="flex items-center gap-2 text-[12.5px] text-ck-ink cursor-pointer">
              <input type="checkbox" name="gxp" defaultChecked={tenant.gxp} className="w-4 h-4" />
              GxP-reguleret
            </label>
            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Standarder i scope</div>
              <div className="flex flex-wrap gap-1.5">
                {STANDARDS.map((s) => (
                  <label key={s} className="flex items-center gap-1 text-[11.5px] text-ck-text-2 border border-ck-border rounded-full px-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      name="standardsInScope"
                      value={s}
                      defaultChecked={tenant.standardsInScope.includes(s)}
                      className="w-3 h-3"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Admin-email</div>
              <input
                name="requestedAdminEmail"
                type="email"
                defaultValue={tenant.requestedAdminEmail ?? ""}
                required
                className="w-full border border-ck-border-2 rounded-lg px-3 py-2 text-[13px] text-ck-ink outline-none focus:border-ck-ink"
              />
            </div>
            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Målsat audit-ready dato (fri tekst, fx &quot;jul 2027&quot;)</div>
              <input
                name="targetDateDkString"
                placeholder="jul 2027"
                className="w-full border border-ck-border-2 rounded-lg px-3 py-2 text-[13px] text-ck-ink outline-none focus:border-ck-ink"
              />
            </div>
            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Noter</div>
              <textarea
                name="requestNotes"
                defaultValue={tenant.requestNotes ?? ""}
                rows={2}
                className="w-full border border-ck-border-2 rounded-lg px-3 py-2 text-[13px] text-ck-ink outline-none focus:border-ck-ink resize-none"
              />
            </div>
            <button
              type="submit"
              className="mt-1 text-[12.5px] font-semibold bg-ck-ink text-white rounded-lg px-3.5 py-2.5 hover:bg-ck-rail-2"
            >
              Godkend og opret workspace
            </button>
          </form>

          <form
            action={rejectTenantRequestAction.bind(null, tenant.id)}
            className="bg-white border border-ck-border rounded-xl p-5 flex flex-col gap-3.5 self-start"
          >
            <div className="text-[13px] font-semibold text-ck-ink mb-1">Afvis anmodning</div>
            <div>
              <div className="text-[11.5px] text-ck-text-2 mb-1">Begrundelse</div>
              <textarea
                name="reason"
                rows={3}
                className="w-full border border-ck-border-2 rounded-lg px-3 py-2 text-[13px] text-ck-ink outline-none focus:border-ck-ink resize-none"
              />
            </div>
            <button
              type="submit"
              className="text-[12.5px] font-semibold bg-white border border-ck-red text-ck-red rounded-lg px-3.5 py-2.5 hover:bg-ck-red-bg"
            >
              Afvis anmodning
            </button>
          </form>
        </div>
      )}

      {tenant.status === "rejected" && (
        <div className="bg-white border border-ck-border rounded-xl p-5 mb-6">
          <div className="text-[13px] font-semibold text-ck-ink mb-1">Afvist</div>
          <div className="text-[12.5px] text-ck-muted">
            {tenant.rejectedAt ? new Date(tenant.rejectedAt).toLocaleDateString("da-DK") : "—"} — {tenant.rejectionReason}
          </div>
        </div>
      )}

      {(tenant.status === "active" || tenant.status === "archived") && (
        <>
          <div className="bg-white border border-ck-border rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-semibold text-ck-ink">Workspace</div>
              {tenant.status === "active" && (
                <form action={archiveTenantAction.bind(null, tenant.id)}>
                  <button type="submit" className="text-[12px] font-medium text-ck-red hover:underline">
                    Arkivér workspace
                  </button>
                </form>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <div>
                <div className="text-ck-muted mb-0.5">Brugere</div>
                <div className="text-ck-ink">{tenant.users}</div>
              </div>
              <div>
                <div className="text-ck-muted mb-0.5">Målsat audit-ready dato</div>
                <div className="text-ck-ink">{estDate ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-ck-muted mb-0.5">Standarder i scope</div>
                <div className="text-ck-ink">{tenant.standardsInScope.length ? tenant.standardsInScope.join(", ") : "—"}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-ck-border rounded-xl p-5 mb-5">
            <div className="text-[13px] font-semibold text-ck-ink mb-3">Invitationer</div>
            <div className="flex flex-col gap-2">
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between text-[12.5px] border-b border-[#f2f4f7] last:border-b-0 pb-2 last:pb-0">
                  <div>
                    <span className="text-ck-ink">{inv.email}</span>{" "}
                    <span className="text-ck-muted">
                      — {INVITE_STATUS_LABEL[inv.status]} · udløber {new Date(inv.expiresAt).toLocaleDateString("da-DK")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {inv.status === "pending" && (
                      <>
                        <span className="text-ck-muted-2 text-[11px] truncate max-w-[220px]">
                          /accept-invite/{inv.token}
                        </span>
                        <form action={revokeInviteAction.bind(null, inv.id)}>
                          <button type="submit" className="text-ck-red hover:underline">
                            Tilbagekald
                          </button>
                        </form>
                      </>
                    )}
                    {inv.status === "expired" && (
                      <form action={resendInviteAction.bind(null, tenant.id, inv.email, inv.role)}>
                        <button type="submit" className="text-ck-indigo hover:underline">
                          Send ny invitation
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              {invites.length === 0 && <div className="text-[12.5px] text-ck-muted">Ingen invitationer endnu.</div>}
            </div>
          </div>

          <div className="bg-white border border-ck-border rounded-xl p-5">
            <div className="text-[13px] font-semibold text-ck-ink mb-3">Rådgiver(e)</div>
            <div className="flex flex-col gap-1.5 mb-3">
              {advisors.map((a) => (
                <div key={a.userId} className="text-[12.5px] text-ck-ink">
                  {a.name} <span className="text-ck-muted">— {a.email}</span>
                </div>
              ))}
              {advisors.length === 0 && <div className="text-[12.5px] text-ck-muted">Ingen rådgiver tildelt.</div>}
            </div>
            {unassignedAdvisors.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {unassignedAdvisors.map((a) => (
                  <form key={a.userId} action={reassignAdvisorAction.bind(null, tenant.id, a.userId)}>
                    <button
                      type="submit"
                      className="text-[12px] font-medium bg-white border border-ck-border rounded-lg px-3 py-1.5 hover:border-ck-ink"
                    >
                      Tildel {a.name}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

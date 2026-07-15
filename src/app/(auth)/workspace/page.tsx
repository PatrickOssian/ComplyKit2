import { redirect } from "next/navigation";
import { pickTenantAction, signOutAction } from "@/lib/actions";
import { currentUser } from "@/lib/data/seed";
import { getTenants } from "@/lib/data/store";
import { getSession } from "@/lib/session";
import { roleMeta } from "@/lib/domain";

export default async function WorkspacePage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const tenants = getTenants();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#eceef1] p-10">
      <div className="w-[560px] max-w-full">
        <div className="flex items-center gap-2.5 mb-6.5">
          <div className="w-[30px] h-[30px] rounded-lg bg-ck-accent flex items-center justify-center text-ck-accent-ink font-bold text-sm">
            C
          </div>
          <div className="font-semibold text-base text-ck-ink tracking-tight">ComplyKit</div>
        </div>
        <div className="text-xl font-semibold text-ck-ink tracking-tight">Vælg en workspace</div>

        {session.advisorMode && (
          <div className="flex items-center gap-2.5 bg-ck-amber-bg border border-ck-amber-border rounded-xl px-3.5 py-2.5 mt-3 mb-1.5">
            <span className="w-[26px] h-[26px] rounded-md shrink-0 bg-ck-amber text-white flex items-center justify-center text-[13px]">
              ✦
            </span>
            <div className="text-[12.5px] text-[#7a4a08] leading-snug">
              <b>Stage One Advisor · super admin.</b> Du kan gå ind i og administrere alle kundesites nedenfor.
            </div>
          </div>
        )}

        <div className="text-[13px] text-ck-muted mt-1.5 mb-5">
          Du har adgang til {tenants.length} tenants. Hver er fuldt isoleret — data krydser aldrig mellem dem.
        </div>

        <div className="flex flex-col gap-2.5">
          {tenants.map((t) => {
            const rm = roleMeta(t.role);
            return (
              <form key={t.id} action={pickTenantAction.bind(null, t.id)}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3.5 bg-white border border-ck-border hover:border-ck-ink hover:shadow-[0_4px_14px_rgba(16,24,40,0.08)] rounded-2xl px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-left"
                >
                  <div
                    className="w-[42px] h-[42px] rounded-xl shrink-0 flex items-center justify-center font-bold text-[15px] text-white"
                    style={{ background: t.tint }}
                  >
                    {t.short}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[14.5px] font-semibold text-ck-ink">{t.name}</div>
                      {t.gxp && (
                        <span className="text-[8.5px] font-semibold tracking-wide text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1.5 py-0.5 rounded">
                          GxP
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-ck-muted mt-0.5">
                      {t.sector} · {t.users} members
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: rm.fg, background: rm.bg }}
                    >
                      {t.role}
                    </span>
                    <span className="text-[10.5px] text-ck-muted">{t.plan}</span>
                  </div>
                  <div className="text-ck-border-2 text-lg ml-0.5">›</div>
                </button>
              </form>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6.5 text-xs text-ck-muted">
          <div>
            Signed in as <span className="text-ck-text-2">{currentUser.email}</span>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="cursor-pointer text-[#667085] hover:text-ck-ink">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

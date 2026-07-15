import { GxpToggleRow } from "@/components/settings/GxpToggleRow";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function SettingsPage() {
  const { session, advisor, tenant } = await requireAppContext();

  return (
    <PageShell title="Indstillinger" subtitle="Workspace-indstillinger og sikkerhed" gxpOn={session.gxp} advisor={advisor}>
      <div className="p-7 pb-12 max-w-[820px]">
        <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[13px] font-semibold text-ck-ink mb-3.5">Workspace</div>
          <div className="flex items-center gap-3 py-2.5 border-b border-[#f2f4f7]">
            <div
              className="w-8.5 h-8.5 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: tenant.tint }}
            >
              {tenant.short}
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-ck-ink">{tenant.name}</div>
              <div className="text-[11px] text-ck-muted">{tenant.plan}</div>
            </div>
            <a href="/workspace" className="text-xs text-ck-indigo font-medium">
              Switch
            </a>
          </div>
          <GxpToggleRow gxpOn={session.gxp} />
        </div>

        <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[13px] font-semibold text-ck-ink mb-1.5">Security</div>
          <div className="flex items-center justify-between py-2.5 border-b border-[#f2f4f7]">
            <div>
              <div className="text-[12.5px] text-ck-ink">Single sign-on</div>
              <div className="text-[11px] text-ck-muted">Entra ID / SAML · SCIM provisioning</div>
            </div>
            <span className="text-[11px] text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2.5 py-0.75 rounded-full">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div>
              <div className="text-[12.5px] text-ck-ink">Multi-factor authentication</div>
              <div className="text-[11px] text-ck-muted">Enforced for every member at sign-in</div>
            </div>
            <span className="text-[11px] text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2.5 py-0.75 rounded-full">
              Enforced
            </span>
          </div>
        </div>

        <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[13px] font-semibold text-ck-ink mb-1.5">Language &amp; region</div>
          <div className="flex items-center justify-between py-2">
            <div className="text-[12.5px] text-ck-ink">Interface language</div>
            <span className="text-xs text-ck-text-2 bg-[#f2f4f7] border border-ck-border px-3 py-1.25 rounded-lg">Dansk</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { pickOrgAction, signOutAction, switchWorkspaceAction, toggleGxpAction } from "@/lib/actions";
import { adminNavItems, navItems } from "@/lib/data/seed";
import type { Tenant } from "@/lib/data/types";

const VIEW_ROUTES: Record<string, string> = {
  overview: "/dashboard",
  actions: "/actions",
  docs: "/docs",
  policy: "/policy",
  roadmap: "/roadmap",
  standards: "/standards",
};

const ADMIN_ROUTES: Record<string, string> = {
  members: "/admin/members",
  billing: "/admin/billing",
  audit: "/admin/audit-log",
  esign: "/admin/e-signatures",
};

interface SideRailProps {
  tenant: Tenant;
  tenants: Tenant[];
  advisorMode: boolean;
  gxpOn: boolean;
  apPct: number;
  pendingCount: number;
  user: { name: string; email: string; init: string };
}

export function SideRail({ tenant, tenants, advisorMode, gxpOn, apPct, pendingCount, user }: SideRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const clientOrgs = tenants.filter((t) => t.id !== "so");

  const handleOrgSwitchClick = () => {
    if (advisorMode) {
      setOrgMenuOpen((v) => !v);
    } else {
      void switchWorkspaceAction();
    }
  };

  const handleToggleGxp = async () => {
    await toggleGxpAction();
    router.refresh();
  };

  return (
    <div className="w-[230px] shrink-0 bg-ck-rail text-[#c3c9d4] px-3.5 py-4 flex flex-col gap-4 overflow-auto">
      <div className="flex items-center gap-2.5 px-1.5 py-0.5">
        <div className="w-7 h-7 rounded-lg bg-ck-accent flex items-center justify-center text-ck-accent-ink font-bold text-sm">
          C
        </div>
        <div className="font-semibold text-[15px] text-white tracking-tight">ComplyKit</div>
      </div>

      <div className="relative">
        <button
          onClick={handleOrgSwitchClick}
          title="Switch workspace"
          className="w-full bg-ck-rail-2 hover:bg-ck-rail-3 rounded-lg px-2.5 py-2 flex items-center gap-2.5 text-left"
        >
          <div
            className="w-6 h-6 rounded-md shrink-0 text-white flex items-center justify-center text-[10px] font-bold"
            style={{ background: tenant.tint }}
          >
            {tenant.short}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11.5px] text-white font-medium truncate">{tenant.name}</div>
            <div className="text-[9.5px] text-[#8a93a3]">{tenant.plan}</div>
          </div>
          {advisorMode && (
            <span className="text-[8.5px] font-bold tracking-wide text-ck-amber bg-[rgba(247,144,9,0.14)] border border-[rgba(247,144,9,0.3)] px-1.5 py-0.5 rounded shrink-0">
              ADVISOR
            </span>
          )}
          <span className="text-[#667085] text-xs shrink-0">⇄</span>
        </button>

        {orgMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOrgMenuOpen(false)} />
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-ck-border rounded-xl shadow-[0_16px_40px_rgba(16,24,40,0.28)] overflow-hidden">
              <div className="text-[9.5px] font-bold tracking-wide uppercase text-ck-amber px-3.5 pt-2.5 pb-1.5">
                Advisor · client sites
              </div>
              {clientOrgs.map((o) => {
                const current = o.id === tenant.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setOrgMenuOpen(false);
                      void pickOrgAction(o.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border-t border-[#f2f4f7] text-left ${current ? "bg-[#f9fafb]" : ""}`}
                  >
                    <div
                      className="w-[26px] h-[26px] rounded-md shrink-0 text-white flex items-center justify-center text-[10px] font-bold"
                      style={{ background: o.tint }}
                    >
                      {o.short}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-ck-ink truncate">{o.name}</div>
                      <div className="text-[10.5px] text-ck-muted">{o.plan}</div>
                    </div>
                    {current && <span className="text-ck-accent text-[13px] shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="text-[9.5px] text-[#667085] uppercase tracking-wide px-2 -mb-2">Workspace</div>
      <nav className="flex flex-col gap-0.5 text-[12.5px]">
        {navItems.map((n) => {
          const active = pathname.startsWith(VIEW_ROUTES[n.v]);
          return (
            <Link
              key={n.v}
              href={VIEW_ROUTES[n.v]}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md ${active ? "bg-ck-rail-2 text-white font-medium" : "text-[#8a93a3]"}`}
            >
              <span className="w-4 text-center text-xs">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="text-[9.5px] text-[#667085] uppercase tracking-wide px-2 -mb-2">Administration</div>
      <nav className="flex flex-col gap-0.5 text-[12.5px]">
        {adminNavItems.map((n) => {
          const active = pathname.startsWith(ADMIN_ROUTES[n.k]);
          const badge = n.k === "esign" && pendingCount ? String(pendingCount) : "";
          return (
            <Link
              key={n.k}
              href={ADMIN_ROUTES[n.k]}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md ${active ? "bg-ck-rail-2 text-white font-medium" : "text-[#8a93a3]"}`}
            >
              <span className="w-4 text-center text-xs">{n.icon}</span>
              <span>{n.label}</span>
              {badge && (
                <span className="ml-auto text-[10px] bg-violet-600 text-white px-1.5 rounded-full">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {gxpOn && (
        <div className="flex items-center gap-2 bg-[#161e2e] border border-[#322058] rounded-lg px-2.5 py-2">
          <div className="w-[7px] h-[7px] rounded-full bg-[#a78bfa] shadow-[0_0_0_3px_rgba(167,139,250,0.18)]" />
          <div className="text-[11px] leading-tight text-[#c4b5fd]">
            Life science / GxP
            <br />
            <span className="text-[#8a7fb0] text-[10px]">overlay aktiv</span>
          </div>
        </div>
      )}

      <div className="mt-auto bg-ck-rail-2 rounded-lg px-3.5 py-3">
        <div className="text-[10.5px] text-[#8a93a3] uppercase tracking-wide mb-2.5">Overall progress</div>
        <div className="flex items-center gap-3">
          <ProgressRing pct={apPct} size={52} strokeWidth={6} trackColor="#2a3548" progressColor="#12b76a" />
          <div>
            <div className="text-lg font-semibold text-white leading-none">{apPct}%</div>
            <div className="text-[10.5px] text-[#8a93a3] mt-1 leading-tight">
              Implemented
              <br />/ approved
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {accountMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
            <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-white border border-ck-border rounded-xl shadow-[0_14px_36px_rgba(16,24,40,0.3)] p-1.5 text-[12.5px] text-ck-text-3">
              <div className="px-2.5 pt-2 pb-1.5">
                <div className="text-[10px] tracking-wide uppercase text-ck-muted font-semibold">Account</div>
                <div className="text-[12.5px] text-ck-ink font-semibold mt-0.5">{user.email}</div>
              </div>
              <div className="h-px bg-[#f0f1f3] my-1 mx-0.5" />
              <button
                onClick={handleToggleGxp}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-ck-page text-left"
              >
                <span className="w-4 text-center text-[13px]">🧬</span>
                <span className="flex-1">Life science / GxP</span>
                <span
                  className={`w-[34px] h-[19px] rounded-full relative inline-block ${gxpOn ? "bg-violet-600" : "bg-ck-border-2"}`}
                >
                  <span
                    className="absolute top-0.5 w-[15px] h-[15px] rounded-full bg-white"
                    style={{ left: gxpOn ? 17 : 2 }}
                  />
                </span>
              </button>
              <div className="h-px bg-[#f0f1f3] my-1 mx-0.5" />
              <Link
                href="/settings"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-ck-page"
              >
                <span className="w-4 text-center text-[13px]">⚙</span>
                <span>Settings</span>
              </Link>
              <Link
                href="/help"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-ck-page"
              >
                <span className="w-4 text-center text-[13px]">?</span>
                <span>Help &amp; Support</span>
              </Link>
              <div className="h-px bg-[#f0f1f3] my-1 mx-0.5" />
              <button
                onClick={() => void signOutAction()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#fef3f2] text-[#b42318] text-left"
              >
                <span className="w-4 text-center text-[13px]">⏻</span>
                <span>Sign out</span>
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setAccountMenuOpen((v) => !v)}
          title="Account"
          className="w-full flex items-center gap-2.5 bg-ck-rail-2 hover:bg-ck-rail-3 rounded-lg px-2.5 py-2 text-left"
        >
          <div className="w-[26px] h-[26px] rounded-full shrink-0 bg-ck-indigo-bg text-ck-indigo text-[10px] font-semibold flex items-center justify-center">
            {user.init}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11.5px] text-white font-medium truncate">{user.name}</div>
            <div className="text-[9.5px] text-[#8a93a3] truncate">{user.email}</div>
          </div>
          <span className="text-[#8a93a3] text-[15px] shrink-0">⋯</span>
        </button>
      </div>
    </div>
  );
}

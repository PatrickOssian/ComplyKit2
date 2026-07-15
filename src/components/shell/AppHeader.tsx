import Link from "next/link";
import type { AdvisorIdentity } from "@/lib/data/types";

interface AppHeaderProps {
  title: string;
  subtitle: string;
  gxpOn: boolean;
  advisor: AdvisorIdentity;
}

export function AppHeader({ title, subtitle, gxpOn, advisor }: AppHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-7 py-3.5 bg-white border-b border-ck-border shrink-0">
      <div>
        <div className="text-lg font-semibold text-ck-ink tracking-tight">{title}</div>
        <div className="text-xs text-ck-muted mt-0.5">{subtitle}</div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {gxpOn && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-ck-violet" />
            Life science / GxP
          </div>
        )}
        <Link
          href="/help"
          title="Rådgiver tilknyttet (managed service) — gå til Help &amp; Support"
          className="flex items-center gap-2 text-[11.5px] text-ck-text-2 bg-white border border-ck-border hover:border-ck-indigo-border hover:bg-[#f9fafb] pl-1.5 pr-2.5 py-1 rounded-full"
        >
          <div className="w-[26px] h-[26px] rounded-full shrink-0 bg-ck-indigo-bg text-ck-indigo text-[10px] font-semibold flex items-center justify-center relative">
            {advisor.initials}
            <span className="absolute right-[-1px] bottom-[-1px] w-2 h-2 rounded-full bg-ck-accent border-[1.5px] border-white" />
          </div>
          <div className="leading-tight">
            <div className="text-ck-ink font-semibold">
              {advisor.firm} · {advisor.name}
            </div>
            <div className="text-[10px] text-ck-muted">Rådgiver · review {advisor.nextReview}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

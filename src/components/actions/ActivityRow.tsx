"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cycleActivityStatusAction } from "@/lib/actions";
import type { Activity } from "@/lib/data/types";
import { prioMeta, statusMeta } from "@/lib/domain";

interface ActivityRowProps {
  activity: Activity;
}

export function ActivityRow({ activity: a }: ActivityRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pm = prioMeta(a.priority);
  const sm = statusMeta(a.status);

  const openDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sel", a.ref);
    router.push(`${pathname}?${params.toString()}`);
  };

  const cycleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await cycleActivityStatusAction(a.ref, a.status);
    router.refresh();
  };

  return (
    <div
      onClick={openDrawer}
      className="grid grid-cols-[56px_1fr_140px_84px_84px_150px_100px] gap-2.5 items-center px-4 py-2.75 border-t border-[#f2f4f7] first:border-t-0 text-xs cursor-pointer hover:bg-[#fbfbfc]"
    >
      <div className="font-mono text-[11px] text-ck-muted">{a.ref}</div>
      <div className="min-w-0">
        <div className="text-ck-ink font-medium">{a.action}</div>
        {(a.tags.length > 0 || a.deps.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {a.tags.map((t) => (
              <span
                key={t.label}
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  t.gxp
                    ? "text-ck-violet-2 bg-ck-violet-bg border-ck-violet-border font-medium"
                    : "text-ck-text-2 bg-[#f2f4f7] border-ck-border"
                }`}
              >
                {t.label}
              </span>
            ))}
            {a.deps.length > 0 && <span className="text-[10px] text-ck-muted">↳ afh. af {a.deps.join(", ")}</span>}
          </div>
        )}
      </div>
      <div className="text-ck-text-2 text-[11.5px] truncate">{a.owner}</div>
      <div>
        <span className="text-[10.5px] font-semibold rounded-full px-2.25 py-0.75" style={{ color: pm.fg, background: pm.bg }}>
          {a.priority}
        </span>
      </div>
      <div className="text-ck-muted text-[11px]">{a.phase.replace("Phase ", "P")}</div>
      <div>
        <button
          onClick={cycleStatus}
          title="Klik for at skifte status"
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
          style={{ color: sm.fg, background: sm.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
          {a.status}
        </button>
      </div>
      <div className="text-right text-[11px] text-ck-muted">{a.target || "—"}</div>
    </div>
  );
}

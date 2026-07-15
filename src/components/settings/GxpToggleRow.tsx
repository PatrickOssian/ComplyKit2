"use client";

import { useRouter } from "next/navigation";
import { toggleGxpAction } from "@/lib/actions";

interface GxpToggleRowProps {
  gxpOn: boolean;
}

export function GxpToggleRow({ gxpOn }: GxpToggleRowProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 pt-3.5 pb-1">
      <div className="flex-1">
        <div className="text-[12.5px] font-medium text-ck-ink">Life science / GxP overlay</div>
        <div className="text-[11px] text-ck-muted">Show GxP-only sections, controls and the Part 11 layer.</div>
      </div>
      <button
        onClick={async () => {
          await toggleGxpAction();
          router.refresh();
        }}
        className={`w-10 h-[23px] rounded-full relative inline-block ${gxpOn ? "bg-ck-violet" : "bg-ck-border-2"}`}
      >
        <span className="absolute top-0.5 w-[19px] h-[19px] rounded-full bg-white" style={{ left: gxpOn ? 19 : 2 }} />
      </button>
    </div>
  );
}

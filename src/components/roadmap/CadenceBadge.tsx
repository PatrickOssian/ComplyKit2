"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setRecurringCadenceAction } from "@/lib/actions";
import { CADS, cadenceColor } from "@/lib/domain";

interface CadenceBadgeProps {
  control: string;
  cadence: string;
}

export function CadenceBadge({ control, cadence }: CadenceBadgeProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="text-[10.5px] font-semibold px-2.25 py-1 rounded-full text-white"
        style={{ background: cadenceColor(cadence) }}
      >
        {cadence}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] left-0 z-50 flex gap-1.25 bg-white border border-ck-border rounded-lg shadow-[0_8px_24px_rgba(16,24,40,0.18)] p-1.5">
            {CADS.map((opt) => (
              <button
                key={opt}
                onClick={async (e) => {
                  e.stopPropagation();
                  setOpen(false);
                  await setRecurringCadenceAction(control, opt);
                  router.refresh();
                }}
                className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap"
                style={{ background: cadenceColor(opt), boxShadow: opt === cadence ? "0 0 0 2px #fff, 0 0 0 4px " + cadenceColor(opt) : undefined, opacity: opt === cadence ? 1 : 0.82 }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

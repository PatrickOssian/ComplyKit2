"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { updateEstDateAction } from "@/lib/actions";

interface ReadinessHeroProps {
  pct: number;
  stateLabel: string;
  color: string;
  bg: string;
  estDate: string;
  estMonthValue: string;
}

export function ReadinessHero({ pct, stateLabel, color, bg, estDate, estMonthValue }: ReadinessHeroProps) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const commit = async (value: string) => {
    setEditing(false);
    await updateEstDateAction(value);
    router.refresh();
  };

  return (
    <div className="bg-[#131a29] rounded-2xl px-6.5 py-5.5 mb-4 flex items-center gap-6 shadow-sm">
      <ProgressRing pct={pct} size={96} strokeWidth={8} trackColor="#2a3548" progressColor="#12b76a" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] tracking-wide uppercase text-[#8a93a3] font-semibold mb-2">
          Er vi klar til audit?
        </div>
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-[38px] font-bold text-white tracking-tight leading-none">{pct}%</span>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color, background: bg }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {stateLabel}
          </span>
        </div>
        <div className="text-[12.5px] text-[#c3c9d4] mt-2">
          Estimeret audit-klar:{" "}
          {editing ? (
            <input
              type="month"
              defaultValue={estMonthValue}
              autoFocus
              onChange={(e) => void commit(e.target.value)}
              onBlur={() => setEditing(false)}
              className="text-[12.5px] font-semibold text-ck-ink border-none rounded px-1.5 py-0.5 bg-white outline-none"
            />
          ) : (
            <b
              onClick={() => setEditing(true)}
              title="Klik for at rette datoen"
              className="text-white font-semibold cursor-pointer border-b border-dashed border-white/45 hover:border-white"
            >
              {estDate}
            </b>
          )}{" "}
          · samlet fremdrift fra handlings- og dokumentplan
        </div>
      </div>
    </div>
  );
}

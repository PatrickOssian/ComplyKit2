"use client";

import { useRouter } from "next/navigation";
import { toggleNavSectionAction } from "@/lib/actions";
import type { NavDef } from "@/lib/data/types";

interface NavSectionsToggleProps {
  items: NavDef[];
  hiddenSections: string[];
}

export function NavSectionsToggle({ items, hiddenSections }: NavSectionsToggleProps) {
  const router = useRouter();

  return (
    <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="text-[13px] font-semibold text-ck-ink mb-1.5">Synlige sektioner</div>
      <div className="text-[11px] text-ck-muted mb-2.5">
        Skjul sektioner der ikke er relevante for denne workspace. Intet slettes — en skjult sektion kan altid slås til igen.
      </div>
      {items.map((item) => {
        const visible = !hiddenSections.includes(item.v);
        return (
          <div key={item.v} className="flex items-center gap-3 py-2.5 border-b border-[#f2f4f7] last:border-b-0">
            <div className="flex-1 flex items-center gap-2.5">
              <span className="w-4 text-center text-xs text-ck-muted">{item.icon}</span>
              <div className="text-[12.5px] text-ck-ink">{item.label}</div>
            </div>
            <button
              onClick={async () => {
                await toggleNavSectionAction(item.v);
                router.refresh();
              }}
              className={`w-10 h-[23px] rounded-full relative inline-block ${visible ? "bg-ck-violet" : "bg-ck-border-2"}`}
            >
              <span className="absolute top-0.5 w-[19px] h-[19px] rounded-full bg-white" style={{ left: visible ? 19 : 2 }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

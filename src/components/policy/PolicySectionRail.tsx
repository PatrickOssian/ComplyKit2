"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPolicySectionAction } from "@/lib/actions";

interface PolicySectionRailProps {
  sections: { num: number; title: string; gxp?: boolean }[];
  currentSel: number;
}

export function PolicySectionRail({ sections, currentSel }: PolicySectionRailProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();

  const confirmAdd = async () => {
    if (!newTitle.trim()) return;
    await addPolicySectionAction(newTitle);
    setAdding(false);
    setNewTitle("");
    router.refresh();
  };

  return (
    <div className="w-[290px] shrink-0 border-r border-ck-border bg-[#fbfbfc] overflow-auto px-3 py-4">
      <div className="text-[10.5px] text-ck-muted uppercase tracking-wide px-1.5 pb-2">{sections.length} afsnit</div>
      {sections.map((s) => {
        const active = s.num === currentSel;
        return (
          <Link
            key={s.num}
            href={`/policy?sel=${s.num}`}
            className={`flex items-center gap-2.25 px-2.75 py-2 rounded-lg text-xs ${active ? "bg-ck-indigo-bg text-ck-indigo font-semibold" : "text-ck-text-2"}`}
          >
            <span className="font-mono text-[10.5px] w-5 shrink-0" style={{ color: active ? "#3538cd" : "#98a2b3" }}>
              {s.num}
            </span>
            <span>{s.title}</span>
            {s.gxp && (
              <span className="ml-auto text-[8.5px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1 py-0.5 rounded">
                GxP
              </span>
            )}
          </Link>
        );
      })}
      {adding ? (
        <div className="mt-2 p-2.5 border border-ck-border-2 rounded-lg bg-white">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titel på nyt afsnit"
            className="w-full box-border text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2.25 py-1.75 outline-none mb-2"
          />
          <div className="flex gap-1.75">
            <button onClick={confirmAdd} className="flex-1 text-center text-xs font-medium text-white bg-ck-indigo rounded-lg py-1.75">
              Tilføj
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewTitle("");
              }}
              className="text-xs text-ck-muted-2 border border-ck-border-2 rounded-lg px-3 py-1.75"
            >
              Annullér
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 mt-2 px-2.75 py-2 rounded-lg text-xs font-medium text-ck-indigo border border-dashed border-[#c7cbf5]"
        >
          <span className="text-[15px] leading-none font-semibold">+</span>
          <span>Tilføj afsnit</span>
        </button>
      )}
    </div>
  );
}

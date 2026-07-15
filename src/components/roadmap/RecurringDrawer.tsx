"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  completeRecurringAction,
  setRecurringFormFieldAction,
  toggleRecurringChecklistItemAction,
} from "@/lib/actions";
import type { RecurringTemplate } from "@/lib/data/types";
import { cadenceColor } from "@/lib/domain";

interface RecurringDrawerProps {
  control: string;
  cadence: string;
  owner: string;
  policyRef: string;
  next: string;
  lastDone: string | null;
  historyCount: number;
  template: RecurringTemplate;
  form: Record<string, unknown>;
}

export function RecurringDrawer({
  control,
  cadence,
  owner,
  policyRef,
  next,
  lastDone,
  historyCount,
  template,
  form,
}: RecurringDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refresh = () => router.refresh();

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("recSel");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setField = async (key: string, value: unknown) => {
    await setRecurringFormFieldAction(control, key, value);
    refresh();
  };

  const canComplete = !!form.outcome;

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(16,24,40,0.35)] z-40" onClick={close} />
      <div className="fixed top-0 right-0 bottom-0 w-[480px] max-w-[94vw] bg-white z-50 shadow-[-8px_0_32px_rgba(16,24,40,0.18)] flex flex-col">
        <div className="flex items-start gap-3 px-5.5 py-5 border-b border-ck-border">
          <div className="flex-1">
            <span
              className="inline-block text-[10.5px] font-semibold px-2.5 py-1 rounded-full text-white mb-2"
              style={{ background: cadenceColor(cadence) }}
            >
              {cadence}
            </span>
            <div className="text-[15px] font-semibold text-ck-ink leading-snug">{control}</div>
            <div className="text-xs text-ck-muted mt-1">
              {owner} · {policyRef} · Næste: {next}
            </div>
          </div>
          <button onClick={close} className="text-xl text-ck-muted leading-none px-1">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5.5 py-5">
          <div className="text-xs text-ck-text-2 leading-relaxed mb-1.5">{template.purpose}</div>
          <div className="text-[11px] text-ck-muted mb-4">
            Estimeret tid: {template.est}
            {lastDone && ` · Sidst udført: ${lastDone}`}
            {historyCount > 0 && ` · ${historyCount} tidligere gennemførsler`}
          </div>

          {template.sections.map((section) => (
            <div key={section.title} className="mb-5">
              <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-2.5">
                {section.title}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {section.fields.map((f) => {
                  const value = form[f.key];
                  const colSpan = f.full ? "col-span-2" : "";
                  if (f.type === "checklist") {
                    const cur = (value as Record<number, boolean>) ?? {};
                    return (
                      <div key={f.key} className={colSpan}>
                        <div className="text-[11px] text-ck-muted mb-1.5">{f.label}</div>
                        <div className="flex flex-col gap-1.5">
                          {(f.items ?? []).map((item, idx) => (
                            <button
                              key={idx}
                              onClick={async () => {
                                await toggleRecurringChecklistItemAction(control, f.key, idx);
                                refresh();
                              }}
                              className="flex items-center gap-2 text-xs text-ck-text-2 text-left"
                            >
                              <span
                                className="w-4 h-4 rounded shrink-0 flex items-center justify-center text-[11px] text-white border-[1.5px]"
                                style={{
                                  borderColor: cur[idx] ? "#3538cd" : "#d0d5dd",
                                  background: cur[idx] ? "#3538cd" : "#fff",
                                }}
                              >
                                {cur[idx] ? "✓" : ""}
                              </span>
                              <span className={cur[idx] ? "text-ck-ink" : ""}>{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (f.type === "select") {
                    return (
                      <div key={f.key} className={colSpan}>
                        <div className="text-[11px] text-ck-muted mb-1">{f.label}</div>
                        <select
                          defaultValue={(value as string) ?? ""}
                          onChange={(e) => void setField(f.key, e.target.value)}
                          className="w-full text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2 py-1.75 bg-white"
                        >
                          <option value="">Vælg …</option>
                          {(f.options ?? []).map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (f.type === "textarea") {
                    return (
                      <div key={f.key} className={colSpan}>
                        <div className="text-[11px] text-ck-muted mb-1">{f.label}</div>
                        <textarea
                          defaultValue={(value as string) ?? ""}
                          onBlur={(e) => void setField(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          rows={3}
                          className="w-full text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2.25 py-2 outline-none resize-y"
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={f.key} className={colSpan}>
                      <div className="text-[11px] text-ck-muted mb-1">
                        {f.label}
                        {f.unit ? ` · ${f.unit}` : ""}
                      </div>
                      <input
                        type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                        defaultValue={(value as string) ?? ""}
                        onBlur={(e) => void setField(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2.25 py-1.75 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={async () => {
              await completeRecurringAction(control);
              close();
            }}
            disabled={!canComplete}
            className={`w-full text-center text-[13px] font-semibold rounded-xl py-2.75 text-white ${canComplete ? "bg-ck-indigo cursor-pointer" : "bg-[#c3c7d1] cursor-not-allowed"}`}
          >
            Marker som udført →
          </button>
        </div>
      </div>
    </>
  );
}

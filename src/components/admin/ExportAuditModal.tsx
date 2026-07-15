"use client";

import { useState } from "react";
import type { AuditEvent } from "@/lib/data/types";

function esc(x: unknown): string {
  return String(x ?? "");
}

function buildExport(rows: AuditEvent[], fmt: "csv" | "json"): string {
  if (fmt === "json") {
    return JSON.stringify(
      rows.map((e) => ({ timestamp: e.time, actor: e.actor, action: e.action, target: e.target, source_ip: e.ip, seal: e.hash })),
      null,
      2,
    );
  }
  const csvEsc = (x: unknown) => {
    const s = String(x ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = "timestamp,actor,action,target,source_ip,seal";
  return `${head}\n${rows.map((e) => [e.time, e.actor, e.action, e.target, e.ip, e.hash].map(csvEsc).join(",")).join("\n")}`;
}

interface ExportAuditModalProps {
  rows: AuditEvent[];
}

export function ExportAuditModal({ rows }: ExportAuditModalProps) {
  const [open, setOpen] = useState(false);
  const [fmt, setFmt] = useState<"csv" | "json">("csv");

  const download = () => {
    const text = buildExport(rows, fmt);
    const mime = fmt === "json" ? "application/json" : "text/csv";
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complykit-audit-trail.${fmt}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-white bg-ck-ink rounded-lg px-3.5 py-2">
        Export CSV / JSON →
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50" onClick={() => setOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-[94vw] bg-white rounded-2xl z-50 shadow-[0_20px_60px_rgba(16,24,40,0.3)] p-5.5">
            <div className="text-[15px] font-semibold text-ck-ink mb-4">Export audit trail ({rows.length} events)</div>
            <div className="flex gap-2 mb-3.5">
              <button
                onClick={() => setFmt("csv")}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg ${fmt === "csv" ? "bg-ck-ink text-white" : "bg-white border border-ck-border text-ck-text-2"}`}
              >
                CSV
              </button>
              <button
                onClick={() => setFmt("json")}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg ${fmt === "json" ? "bg-ck-ink text-white" : "bg-white border border-ck-border text-ck-text-2"}`}
              >
                JSON
              </button>
            </div>
            <pre className="bg-[#101828] text-[#c3c9d4] text-[10.5px] rounded-lg p-3.5 overflow-auto max-h-[280px] mb-4 whitespace-pre-wrap break-all">
              {esc(buildExport(rows, fmt)).slice(0, 4000)}
            </pre>
            <div className="flex gap-2.5">
              <button onClick={() => setOpen(false)} className="text-[13px] text-ck-text-2 border border-ck-border-2 rounded-lg px-4 py-2.25">
                Luk
              </button>
              <button onClick={download} className="flex-1 text-center text-[13px] font-semibold text-white bg-ck-indigo rounded-lg py-2.25">
                Download file
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

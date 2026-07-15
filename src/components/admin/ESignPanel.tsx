"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signPendingDocumentAction } from "@/lib/actions";
import type { PendingSignature, SignedRecord } from "@/lib/data/types";

const MEANINGS: { label: string; desc: string }[] = [
  { label: "Authored", desc: "Prepared and drafted this document" },
  { label: "Reviewed", desc: "Checked for accuracy and completeness" },
  { label: "Approved", desc: "Authorised for release / effective use" },
];

interface ESignPanelProps {
  pending: PendingSignature[];
  signed: SignedRecord[];
}

export function ESignPanel({ pending, signed }: ESignPanelProps) {
  const router = useRouter();
  const [esignId, setEsignId] = useState<string | null>(null);
  const [meaning, setMeaning] = useState("Approved");
  const [pwd, setPwd] = useState("");

  const doc = pending.find((p) => p.id === esignId);

  const close = () => {
    setEsignId(null);
    setPwd("");
  };

  const signNow = async () => {
    if (!doc || pwd.length < 4) return;
    await signPendingDocumentAction(doc.id, meaning);
    close();
    router.refresh();
  };

  return (
    <>
      <div className="text-[13px] font-semibold text-ck-ink mb-3">Afventer din underskrift</div>
      <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)] mb-6">
        {pending.length === 0 && <div className="px-4 py-6 text-center text-xs text-ck-muted">Intet afventer underskrift.</div>}
        {pending.map((p) => (
          <div key={p.id} className="flex items-center gap-3.5 px-4.5 py-3 border-t border-[#f2f4f7] first:border-t-0 text-xs">
            <div className="flex-1 min-w-0">
              <div className="text-ck-ink font-medium flex items-center gap-1.5">
                {p.doc}
                {p.gxp && (
                  <span className="text-[8.5px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1 py-0.5 rounded">
                    GxP
                  </span>
                )}
              </div>
              <div className="text-[10.5px] text-ck-muted mt-0.5">
                {p.version} · {p.role} · Ønsket af {p.requested} · Frist {p.due}
              </div>
            </div>
            <button
              onClick={() => {
                setEsignId(p.id);
                setMeaning("Approved");
                setPwd("");
              }}
              className="text-[11.5px] font-medium text-white bg-ck-violet rounded-lg px-3.5 py-1.75 whitespace-nowrap"
            >
              Review &amp; sign
            </button>
          </div>
        ))}
      </div>

      <div className="text-[13px] font-semibold text-ck-ink mb-3">Signature history</div>
      <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-[1fr_100px_120px_150px] gap-2 px-4 py-2.75 text-[10px] tracking-wide uppercase text-ck-muted bg-[#fafafa] border-b border-ck-border">
          <div>Document</div>
          <div>Version</div>
          <div>Meaning</div>
          <div>When</div>
        </div>
        {signed.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_120px_150px] gap-2 items-center px-4 py-2.75 border-t border-[#f2f4f7] text-xs">
            <div className="text-ck-ink font-medium">{s.doc}</div>
            <div className="text-ck-muted-2 font-mono">{s.version}</div>
            <div className="text-ck-muted-2">{s.meaning}</div>
            <div className="text-ck-muted">{s.when}</div>
          </div>
        ))}
      </div>

      {doc && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50" onClick={close} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[94vw] bg-white rounded-2xl z-50 shadow-[0_20px_60px_rgba(16,24,40,0.3)] p-5.5">
            <div className="text-[10.5px] font-semibold tracking-wide uppercase text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border inline-block px-2 py-0.5 rounded mb-2.5">
              21 CFR Part 11 · EU GMP Annex 11
            </div>
            <div className="text-[15px] font-semibold text-ck-ink mb-4">
              {doc.doc} — {doc.version}
            </div>
            <div className="text-[11px] text-ck-muted mb-2">Meaning of signature</div>
            <div className="flex flex-col gap-2 mb-4">
              {MEANINGS.map((m) => {
                const on = meaning === m.label;
                return (
                  <button
                    key={m.label}
                    onClick={() => setMeaning(m.label)}
                    className="flex items-start gap-2.75 border rounded-lg px-3.25 py-2.75 text-left"
                    style={{ borderColor: on ? "#7a5af8" : "#eaecf0", background: on ? "#f9f8ff" : "#fff" }}
                  >
                    <span
                      className="w-3.75 h-3.75 rounded-full shrink-0 mt-0.25"
                      style={{ border: on ? "5px solid #7a5af8" : "1.5px solid #d0d5dd" }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-ck-ink">{m.label}</div>
                      <div className="text-[11px] text-ck-muted">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-ck-muted mb-1.25">Re-enter password to authenticate</div>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full box-border text-[13px] text-ck-ink border border-ck-border-2 rounded-lg px-2.75 py-2.25 outline-none mb-3"
            />
            <div className="text-[10.5px] text-ck-muted leading-relaxed bg-[#fbfbfc] border border-ck-border rounded-lg px-2.75 py-2.25 mb-4">
              I certify that this electronic signature is the legally binding equivalent of my handwritten signature.
            </div>
            <div className="flex gap-2.5">
              <button onClick={close} className="text-[13px] text-ck-text-2 border border-ck-border-2 rounded-lg px-4 py-2.25">
                Cancel
              </button>
              <button
                onClick={signNow}
                disabled={pwd.length < 4}
                className={`flex-1 text-center text-[13px] font-medium rounded-lg py-2.25 text-white ${pwd.length >= 4 ? "bg-ck-violet" : "bg-[#cfc3f7] cursor-not-allowed"}`}
              >
                Apply signature
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

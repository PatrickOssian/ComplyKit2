"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setBillingPlanAction } from "@/lib/actions";
import type { PlanDef } from "@/lib/data/seed";
import type { Invoice } from "@/lib/data/types";
import { buildInvoiceHtml } from "@/lib/reports/invoice-report";
import { openAndPrintReport } from "@/lib/reports/audit-report";

interface BillingPanelProps {
  orgName: string;
  plans: PlanDef[];
  currentPlan: "essentials" | "compliance" | "gxp";
  invoices: Invoice[];
}

export function BillingPanel({ orgName, plans, currentPlan, invoices }: BillingPanelProps) {
  const router = useRouter();
  const [salesOpen, setSalesOpen] = useState(false);
  const [salesEmail, setSalesEmail] = useState("");
  const [salesMsg, setSalesMsg] = useState("");
  const [salesSent, setSalesSent] = useState(false);

  const validEmail = /.+@.+\..+/.test(salesEmail);

  const closeSales = () => {
    setSalesOpen(false);
    setSalesEmail("");
    setSalesMsg("");
    setSalesSent(false);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {plans.map((p) => {
          const current = p.key === currentPlan;
          const isSales = !current && p.key === "gxp";
          return (
            <div
              key={p.key}
              className="relative flex flex-col bg-white border rounded-2xl px-5 py-5"
              style={{
                borderColor: current ? p.accent : "#eaecf0",
                boxShadow: current ? `0 0 0 3px ${p.accent}22` : "0 1px 2px rgba(16,24,40,0.04)",
              }}
            >
              <div className="text-[15px] font-semibold text-ck-ink mb-0.5">{p.name}</div>
              <div className="text-[11px] text-ck-muted mb-3">{p.tagline}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[26px] font-bold text-ck-ink">{p.price}</span>
                <span className="text-xs text-ck-muted">{p.unit}</span>
              </div>
              <div className="text-[11px] text-ck-muted mb-4">{p.seats}</div>
              <div className="flex flex-col gap-1.75 mb-5">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-1.75 text-[11.5px] text-ck-text-2">
                    <span style={{ color: p.accent }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  if (current) return;
                  if (isSales) {
                    setSalesOpen(true);
                    return;
                  }
                  await setBillingPlanAction(p.key);
                  router.refresh();
                }}
                disabled={current}
                className="mt-auto text-center text-[12.5px] font-medium rounded-lg py-2.5"
                style={
                  current
                    ? { color: "#98a2b3", background: "#f6f7f9", border: "1px solid #eaecf0", cursor: "default" }
                    : { color: "#fff", background: p.accent, cursor: "pointer" }
                }
              >
                {current ? "Current plan" : p.key === "gxp" ? "Talk to sales" : `Switch to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="text-[13px] font-semibold text-ck-ink mb-3">Betalingsmetode</div>
        <div className="flex items-center gap-3.5 text-xs text-ck-text-2">
          <div className="w-10 h-7 rounded bg-[#101828] text-white text-[9px] font-bold flex items-center justify-center">
            VISA
          </div>
          <div>···· 4242</div>
          <div className="text-ck-muted ml-auto">Secured &amp; processed by Stripe</div>
        </div>
      </div>

      <div className="text-[13px] font-semibold text-ck-ink mb-3">Fakturaer</div>
      <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {invoices.map((iv, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr_100px_100px_60px] gap-2 items-center px-4.5 py-3 border-t border-[#f2f4f7] first:border-t-0 text-xs">
            <div className="text-ck-muted-2">{iv.date}</div>
            <div className="text-ck-ink font-medium">{iv.plan}</div>
            <div className="text-ck-muted-2">{iv.amount}</div>
            <div>
              <span className="text-[10.5px] font-medium text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2 py-0.75 rounded-full">
                {iv.status}
              </span>
            </div>
            <button
              onClick={() => openAndPrintReport(buildInvoiceHtml({ orgName, date: iv.date, amount: iv.amount, plan: iv.plan }))}
              className="text-ck-indigo font-medium text-[11.5px] text-right"
            >
              PDF
            </button>
          </div>
        ))}
      </div>

      {salesOpen && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50" onClick={closeSales} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[92vw] bg-white rounded-2xl z-50 shadow-[0_20px_60px_rgba(16,24,40,0.3)] p-5.5">
            {salesSent ? (
              <>
                <div className="text-[15px] font-semibold text-ck-ink mb-2">Tak — vi vender tilbage</div>
                <div className="text-xs text-ck-muted-2 mb-4">En fra Stage One kontakter dig på {salesEmail}.</div>
                <button onClick={closeSales} className="w-full text-center text-[13px] font-medium text-white bg-ck-ink rounded-lg py-2.25">
                  Luk
                </button>
              </>
            ) : (
              <>
                <div className="text-[15px] font-semibold text-ck-ink mb-4">GxP Validated · Talk to sales</div>
                <div className="text-[11px] text-ck-muted mb-1.25">Email</div>
                <input
                  value={salesEmail}
                  onChange={(e) => setSalesEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full box-border text-[13px] text-ck-ink border border-ck-border-2 rounded-lg px-2.75 py-2.25 outline-none mb-3"
                />
                <div className="text-[11px] text-ck-muted mb-1.25">Besked</div>
                <textarea
                  value={salesMsg}
                  onChange={(e) => setSalesMsg(e.target.value)}
                  rows={3}
                  className="w-full box-border text-[13px] text-ck-ink border border-ck-border-2 rounded-lg px-2.75 py-2.25 outline-none mb-4 resize-none"
                />
                <div className="flex gap-2.5">
                  <button onClick={closeSales} className="text-[13px] text-ck-text-2 border border-ck-border-2 rounded-lg px-4 py-2.25">
                    Annuller
                  </button>
                  <button
                    onClick={() => validEmail && setSalesSent(true)}
                    disabled={!validEmail}
                    className={`flex-1 text-center text-[13px] font-semibold rounded-lg py-2.25 text-white ${validEmail ? "bg-ck-violet" : "bg-[#cfc3f7] cursor-not-allowed"}`}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

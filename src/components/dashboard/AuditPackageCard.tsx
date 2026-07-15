"use client";

import { useState } from "react";
import { buildAuditReportHtml, openAndPrintReport, type AuditReportInput } from "@/lib/reports/audit-report";

interface AuditPackageCardProps {
  orgName: string;
  estDate: string;
  reportInput: AuditReportInput;
}

export function AuditPackageCard({ orgName, estDate, reportInput }: AuditPackageCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col">
      <div className="text-[13px] font-semibold text-ck-ink mb-0.5">Til audit / bestyrelse</div>
      <div className="text-[11px] text-ck-muted mb-3.5">Én samlet pakke til revisor eller ledelse</div>
      <div className="text-xs text-ck-text-2 leading-relaxed mb-4">
        Samler readiness, åbne kritiske punkter, dokumentstatus og politik i ét overblik — klar til at vise frem.
      </div>
      <button
        onClick={() => setOpen(true)}
        className="mt-auto text-center text-[13px] font-semibold text-white bg-ck-indigo hover:bg-[#2a2ba8] rounded-lg px-3.5 py-2.5"
      >
        Generér bestyrelses-/audit-pakke
      </button>
      <div className="text-[10px] text-ck-muted mt-2.5 leading-snug">
        Preview · understøtter alignment, ikke certificering.
      </div>

      {open && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.45)] z-50" onClick={() => setOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-w-[94vw] max-h-[88vh] overflow-auto bg-white rounded-2xl z-50 shadow-[0_24px_70px_rgba(16,24,40,0.32)]">
            <div className="px-6 py-5 border-b border-ck-border flex items-start gap-3">
              <div className="flex-1">
                <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1">
                  Preview · bestyrelses- / audit-pakke
                </div>
                <div className="text-[17px] font-semibold text-ck-ink">{orgName}</div>
                <div className="text-xs text-ck-muted mt-0.5">Genereret {estDate}-status · informationssikkerhed (ISMS)</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-2xl text-ck-muted leading-none px-1">
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-ck-page rounded-lg p-3.5">
                  <div className="text-2xl font-bold text-ck-ink">{reportInput.readyPct}%</div>
                  <div className="text-[11px] text-ck-text-2 mt-0.5">Audit-readiness</div>
                </div>
                <div className="bg-ck-page rounded-lg p-3.5">
                  <div className="text-2xl font-bold text-[#b42318]">{reportInput.blocking.length}</div>
                  <div className="text-[11px] text-ck-text-2 mt-0.5">Haster nu</div>
                </div>
                <div className="bg-ck-page rounded-lg p-3.5">
                  <div className="text-2xl font-bold text-ck-ink">{reportInput.dcPct}%</div>
                  <div className="text-[11px] text-ck-text-2 mt-0.5">Dokumenter klar</div>
                </div>
              </div>
              <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-2.5">
                Indhold i pakken
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {[
                  "Ledelsesresumé med audit-readiness og estimeret klar-dato",
                  "Liste over åbne kritiske/høje punkter og overskredne datoer",
                  "Readiness pr. rammeværk (ISO 27001, NIS2 m.fl.)",
                  "Dokument- og politikstatus med versioner og godkendelser",
                ].map((line) => (
                  <div
                    key={line}
                    className="flex items-center gap-2.5 text-[12.5px] text-ck-text-3 bg-white border border-ck-border rounded-lg px-3 py-2.5"
                  >
                    <span className="text-ck-accent">✓</span>
                    {line}
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 items-center">
                <button
                  onClick={() => openAndPrintReport(buildAuditReportHtml(reportInput))}
                  className="flex-1 text-center text-[13px] font-semibold text-white bg-ck-indigo hover:bg-[#2a2ba8] rounded-lg py-2.5"
                >
                  Download som PDF
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[13px] text-ck-text-2 border border-ck-border-2 rounded-lg px-4 py-2.5"
                >
                  Luk
                </button>
              </div>
              <div className="text-[10px] text-ck-muted mt-3 leading-relaxed">
                Åbner en printvenlig rapport — vælg &quot;Gem som PDF&quot; i printdialogen. ComplyKit understøtter
                alignment med de nævnte standarder. Organisationen bør ikke fremstå som certificeret, medmindre
                certificering er selvstændigt og eksplicit opnået.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

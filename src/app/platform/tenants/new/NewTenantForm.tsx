"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitTenantRequestAction } from "@/lib/platform-actions";

const STANDARDS = [
  { key: "ISO 27001", label: "ISO/IEC 27001" },
  { key: "NIS2", label: "NIS2" },
  { key: "GDPR", label: "GDPR" },
  { key: "EU GMP Annex 11", label: "EU GMP Annex 11" },
  { key: "21 CFR Part 11", label: "21 CFR Part 11" },
  { key: "GAMP 5", label: "GAMP 5" },
  { key: "ALCOA+", label: "ALCOA+" },
  { key: "GxP", label: "GxP" },
];

export default function NewTenantForm({ isPlatformAdmin }: { isPlatformAdmin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [gxp, setGxp] = useState(false);
  const [standardsInScope, setStandardsInScope] = useState<string[]>([]);
  const [requestNotes, setRequestNotes] = useState("");
  const [requestedAdminEmail, setRequestedAdminEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ mode: "direct" | "request"; tenantId: string } | null>(null);

  function toggleStandard(key: string) {
    setStandardsInScope((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await submitTenantRequestAction({
      name,
      sector,
      gxp,
      standardsInScope,
      requestNotes: requestNotes.trim() || null,
      requestedAdminEmail: requestedAdminEmail.trim() || null,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.mode === "direct") {
      router.push(`/platform/tenants/${result.tenantId}`);
      return;
    }
    setCreated({ mode: result.mode, tenantId: result.tenantId });
  }

  if (created) {
    return (
      <div className="max-w-[560px]">
        <h1 className="text-xl font-semibold text-ck-ink mb-1">Anmodning sendt</h1>
        <div className="text-[13px] text-ck-muted mb-5">
          Din anmodning om et nyt workspace er sendt til godkendelse hos en platform admin.
        </div>
        <button
          onClick={() => router.push(`/platform/requests?created=${created.tenantId}`)}
          className="text-[13px] font-medium bg-ck-ink text-white rounded-lg px-4 py-2.5 hover:bg-ck-rail-2"
        >
          Se mine anmodninger
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[560px]">
      <h1 className="text-xl font-semibold text-ck-ink mb-1">Nyt workspace</h1>
      <div className="text-[13px] text-ck-muted mb-6">
        {isPlatformAdmin
          ? "Udfyld oplysningerne om kundens organisation. Workspacet oprettes og seedes med det samme, og en invitationslink oprettes til admin-emailen."
          : "Udfyld oplysningerne om kundens organisation. En platform admin gennemgår og godkender anmodningen, før workspacet oprettes."}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <div>
          <div className="text-[12.5px] text-ck-text-2 mb-1.5">Organisationsnavn</div>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="f.eks. Nordic Pharma Logistics A/S"
            className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none focus:border-ck-ink"
          />
        </div>

        <div>
          <div className="text-[12.5px] text-ck-text-2 mb-1.5">Sektor</div>
          <input
            required
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="f.eks. Pharma logistics"
            className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none focus:border-ck-ink"
          />
        </div>

        <label className="flex items-center gap-2.5 text-[13px] text-ck-ink cursor-pointer">
          <input type="checkbox" checked={gxp} onChange={(e) => setGxp(e.target.checked)} className="w-4 h-4" />
          GxP-reguleret
        </label>

        <div>
          <div className="text-[12.5px] text-ck-text-2 mb-1.5">Standarder i scope (informativt)</div>
          <div className="flex flex-wrap gap-2">
            {STANDARDS.map((s) => (
              <button
                type="button"
                key={s.key}
                onClick={() => toggleStandard(s.key)}
                className={`text-[12px] px-3 py-1.5 rounded-full border ${
                  standardsInScope.includes(s.key)
                    ? "bg-ck-ink text-white border-ck-ink"
                    : "text-ck-text-2 bg-white border-ck-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12.5px] text-ck-text-2 mb-1.5">
            Admin-email (den første bruger, der får en invitation){isPlatformAdmin ? "" : " — valgfrit, kan tilføjes ved godkendelse"}
          </div>
          <input
            type="email"
            required={isPlatformAdmin}
            value={requestedAdminEmail}
            onChange={(e) => setRequestedAdminEmail(e.target.value)}
            placeholder="admin@kunde.dk"
            className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none focus:border-ck-ink"
          />
        </div>

        <div>
          <div className="text-[12.5px] text-ck-text-2 mb-1.5">Noter (valgfrit)</div>
          <textarea
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            rows={3}
            className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none focus:border-ck-ink resize-none"
          />
        </div>

        {error && <div className="text-[12.5px] text-ck-red -mt-1">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-center bg-ck-ink hover:bg-ck-rail-2 text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Sender…" : isPlatformAdmin ? "Opret workspace" : "Send anmodning"}
        </button>
      </form>
    </div>
  );
}

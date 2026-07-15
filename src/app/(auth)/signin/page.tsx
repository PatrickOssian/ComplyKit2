"use client";

import { useState } from "react";
import { signInAction } from "@/lib/actions";
import { demoLogins } from "@/lib/data/seed";

type Lang = "da" | "en";

const COPY: Record<
  Lang,
  {
    eyebrow: string;
    headline: string;
    para: string;
    bullets: string[];
    disclaimer: string;
    formTitle: string;
    formSub: string;
    msBtn: string;
    samlBtn: string;
    soon: string;
    soonHint: string;
    divider: string;
    emailLabel: string;
    emailPh: string;
    pwdLabel: string;
    demoTitle: string;
    demoAdvisorRole: string;
  }
> = {
  da: {
    eyebrow: "ISMS · bygget til regulerede teams",
    headline: "Dit ledelsessystem for informationssikkerhed — samlet i ét workspace.",
    para: "Kør hele jeres ISMS fra én kilde til sandhed — sikkerhedspolitik, risikobaseret handlingsplan, kontrollerede dokumenter og audit-klar dokumentation. Hver ændring fanges i et uforanderligt audit-spor.",
    bullets: [
      "Aligner med ISO 27001, NIS2 & GDPR",
      "21 CFR Part 11 & EU GMP Annex 11 e-signaturer",
      "EU-hostet · data isoleret pr. tenant",
    ],
    disclaimer: "Understøtter alignment med de nævnte standarder. Ikke en erklæring om certificering.",
    formTitle: "Log ind",
    formSub: "Brug din organisationskonto.",
    msBtn: "Fortsæt med Microsoft (Entra ID)",
    samlBtn: "Fortsæt med SAML SSO",
    soon: "snart",
    soonHint: "Tilgængelig snart",
    divider: "eller med e-mail",
    emailLabel: "Arbejds-e-mail",
    emailPh: "dig@virksomhed.dk",
    pwdLabel: "Adgangskode",
    demoTitle: "Demo-logins (adgangskode: complykit123)",
    demoAdvisorRole: "rådgiver → Nordic Pharma",
  },
  en: {
    eyebrow: "ISMS · built for regulated teams",
    headline: "Your management system for information security — in one workspace.",
    para: "Run your entire ISMS from a single source of truth — security policy, risk-based action plan, controlled documents and audit-ready documentation. Every change is captured in an immutable audit trail.",
    bullets: [
      "Aligns with ISO 27001, NIS2 & GDPR",
      "21 CFR Part 11 & EU GMP Annex 11 e-signatures",
      "EU-hosted · data isolated per tenant",
    ],
    disclaimer: "Supports alignment with the named standards. Not a statement of certification.",
    formTitle: "Sign in",
    formSub: "Use your organisation account.",
    msBtn: "Continue with Microsoft (Entra ID)",
    samlBtn: "Continue with SAML SSO",
    soon: "soon",
    soonHint: "Available soon",
    divider: "or with email",
    emailLabel: "Work email",
    emailPh: "you@company.com",
    pwdLabel: "Password",
    demoTitle: "Demo logins (password: complykit123)",
    demoAdvisorRole: "advisor → Nordic Pharma",
  },
};

export default function SignInPage() {
  const [lang, setLang] = useState<Lang>("da");
  const t = COPY[lang];

  return (
    <div className="min-h-screen flex relative bg-white">
      <div className="absolute top-[22px] right-[26px] z-10 flex items-center bg-ck-ink rounded-full p-0.5">
        <button
          onClick={() => setLang("da")}
          className={`text-[11px] font-semibold px-3 py-1 rounded-full ${lang === "da" ? "bg-white text-ck-ink" : "text-[#8a93a3]"}`}
        >
          DA
        </button>
        <button
          onClick={() => setLang("en")}
          className={`text-[11px] font-semibold px-3 py-1 rounded-full ${lang === "en" ? "bg-white text-ck-ink" : "text-[#8a93a3]"}`}
        >
          EN
        </button>
      </div>

      <div className="flex-1 min-w-0 bg-ck-ink px-14 py-12 flex flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-lg bg-ck-accent flex items-center justify-center text-ck-accent-ink font-bold text-[17px]">
            C
          </div>
          <div className="font-semibold text-lg text-white tracking-tight">ComplyKit</div>
        </div>
        <div className="max-w-[520px]">
          <div className="text-[11px] font-semibold tracking-[1.4px] uppercase text-ck-accent mb-4.5">
            {t.eyebrow}
          </div>
          <div className="text-[38px] font-semibold text-white leading-tight tracking-tight mb-5">
            {t.headline}
          </div>
          <div className="text-[15px] leading-relaxed text-[#98a2b3] mb-7">{t.para}</div>
          <div className="flex flex-col gap-3">
            {t.bullets.map((b) => (
              <div key={b} className="flex items-center gap-3 text-[14.5px] text-[#e4e7ec]">
                <span className="w-[7px] h-[7px] rounded-full bg-ck-accent shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>
        <div className="text-[11.5px] text-[#5c6675] leading-relaxed max-w-[520px]">{t.disclaimer}</div>
      </div>

      <div className="flex-1 min-w-0 bg-white flex flex-col justify-center px-14 py-12">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="text-[28px] font-semibold text-ck-ink tracking-tight">{t.formTitle}</div>
          <div className="text-sm text-ck-muted mt-1.5 mb-6.5">{t.formSub}</div>

          <div
            title={t.soonHint}
            className="flex items-center justify-center gap-2.5 bg-white border border-ck-border rounded-xl p-3.5 text-[13.5px] font-medium text-ck-muted mb-2.5 cursor-not-allowed"
          >
            <span className="grid grid-cols-2 grid-rows-2 gap-0.5 shrink-0 opacity-50 w-[20px] h-[20px]">
              <span className="bg-[#f25022]" />
              <span className="bg-[#7fba00]" />
              <span className="bg-[#00a4ef]" />
              <span className="bg-[#ffb900]" />
            </span>
            {t.msBtn}
            <span className="text-[9.5px] font-semibold tracking-wide text-ck-muted bg-[#f2f4f7] rounded px-1.5 py-0.5">
              {t.soon}
            </span>
          </div>
          <div
            title={t.soonHint}
            className="flex items-center justify-center gap-2.5 bg-white border border-ck-border rounded-xl p-3.5 text-[13.5px] font-medium text-ck-muted mb-5 cursor-not-allowed"
          >
            <span className="w-[15px] h-[15px] rounded border-[1.5px] border-[#cbd2dc] shrink-0 flex items-center justify-center text-[9px] text-[#cbd2dc]">
              S
            </span>
            {t.samlBtn}
            <span className="text-[9.5px] font-semibold tracking-wide text-ck-muted bg-[#f2f4f7] rounded px-1.5 py-0.5">
              {t.soon}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ck-border" />
            <div className="text-[11.5px] text-ck-muted">{t.divider}</div>
            <div className="flex-1 h-px bg-ck-border" />
          </div>

          <form action={signInAction}>
            <div className="text-[12.5px] text-ck-text-2 mb-1.5">{t.emailLabel}</div>
            <input
              placeholder={t.emailPh}
              className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none mb-4 focus:border-ck-ink"
            />
            <div className="text-[12.5px] text-ck-text-2 mb-1.5">{t.pwdLabel}</div>
            <input
              type="password"
              className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none mb-4.5 focus:border-ck-ink"
            />
            <button
              type="submit"
              className="w-full text-center bg-ck-ink hover:bg-ck-rail-2 text-white rounded-xl py-3.5 text-sm font-semibold"
            >
              {t.formTitle}
            </button>
          </form>

          <div className="border border-ck-border bg-[#fbfbfc] rounded-xl px-4 py-3.5 mt-5.5">
            <div className="text-[11.5px] font-semibold text-ck-text-2 mb-2">{t.demoTitle}</div>
            <div className="flex flex-col gap-1">
              {demoLogins.map((d) => (
                <div key={d.email} className="text-[11.5px] text-ck-muted leading-relaxed">
                  <span className="text-ck-indigo">{d.email}</span> —{" "}
                  {d.email === "advisor@stageone.dk" ? t.demoAdvisorRole : d.role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

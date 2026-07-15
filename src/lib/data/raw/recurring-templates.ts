// ComplyKit — skabeloner for tilbagevendende kontroller.
// Hver skabelon udfyldes af brugeren når kontrollen udføres; "Marker som udført"
// gemmer en snapshot og rykker næste forfaldsdato ud fra kadencen.
// Felttyper: text | textarea | select | date | number | checklist
// (checklist-felter: items = liste af punkter der kan afkrydses)

import type { RecurringTemplate } from "../types";

export const cadenceMonths: Record<string, number> = {
  "Monthly": 1,
  "Quarterly": 3,
  "Semi-annual": 6,
  "Annual": 12,
  "Annual (or on change)": 12,
};

export const templates: Record<string, RecurringTemplate> = {
  "Administrative-access review": {
    purpose: "Bekræft at alle privilegerede/administrative konti stadig er nødvendige, korrekt tildelt og MFA-beskyttet.",
    est: "20–30 min",
    sections: [
      { title: "Omfang", fields: [
        { key: "reviewer", label: "Gennemgået af", type: "text", placeholder: "Navn / rolle" },
        { key: "period", label: "Gennemgangsperiode", type: "text", placeholder: "fx Q3 2026" },
        { key: "systems", label: "Systemer i omfang", type: "checklist", full: true,
          items: ["Microsoft 365 / Entra ID", "Server- og netværksinfrastruktur", "ERP / forretningssystem", "Backup-platform", "Cloud-konsoller (Azure/AWS)"] },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér for hver admin-konto", type: "checklist", full: true,
          items: [
            "Alle admin-konti er knyttet til en navngiven person",
            "Ingen delte/generiske admin-konti i brug",
            "Rettigheder svarer til aktuel rolle (least privilege)",
            "MFA håndhævet på samtlige admin-konti",
            "Fratrådte/inaktive konti er fjernet eller spærret",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "revoked", label: "Konti fjernet/justeret", type: "number", unit: "stk" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Ingen afvigelser", "Afvigelser rettet", "Opfølgning kræves"] },
        { key: "findings", label: "Fund & bemærkninger", type: "textarea", full: true,
          placeholder: "Noter afvigelser, rettede fejl eller opfølgningspunkter …" },
      ]},
    ],
  },

  "Central user-access review": {
    purpose: "Kryds alle brugeradgange af mod HR's aktive medarbejderliste og bekræft korrekt rolletildeling.",
    est: "30–45 min",
    sections: [
      { title: "Omfang", fields: [
        { key: "reviewer", label: "Gennemgået af", type: "text", placeholder: "Navn / rolle" },
        { key: "period", label: "Gennemgangsperiode", type: "text", placeholder: "fx H2 2026" },
        { key: "systems", label: "Systemer i omfang", type: "checklist", full: true,
          items: ["Microsoft 365 / Entra ID", "ERP / forretningssystem", "Fildeling / SharePoint", "Fagsystemer", "Eksterne SaaS-tjenester"] },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Brugere krydstjekket mod HR's aktive liste",
            "Fratrådte deaktiveret rettidigt",
            "Rolleændringer afspejlet i adgange",
            "Gæste-/eksterne konti valideret og tidsbegrænset",
            "Funktionsadskillelse (SoD) kontrolleret",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "adjusted", label: "Adgange justeret", type: "number", unit: "stk" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Ingen afvigelser", "Afvigelser rettet", "Opfølgning kræves"] },
        { key: "findings", label: "Fund & bemærkninger", type: "textarea", full: true,
          placeholder: "Noter afvigelser, rettede fejl eller opfølgningspunkter …" },
      ]},
    ],
  },

  "Backup restore test (critical systems)": {
    purpose: "Dokumentér en reel gendannelse fra backup og bekræft at RTO/RPO-mål kan overholdes.",
    est: "1–2 timer",
    sections: [
      { title: "Test-setup", fields: [
        { key: "system", label: "Testet system", type: "text", placeholder: "fx ERP-database" },
        { key: "tester", label: "Udført af", type: "text", placeholder: "IT / MSP-navn" },
        { key: "backupDate", label: "Anvendt backup fra", type: "date" },
        { key: "restoreDate", label: "Gendannet dato", type: "date" },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Backup lokaliseret og hentet",
            "Gendannelse gennemført til testmiljø",
            "Dataintegritet verificeret (stikprøve)",
            "RTO-mål overholdt",
            "RPO-mål overholdt",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "rto", label: "RTO — mål vs. faktisk", type: "text", placeholder: "fx 4 t / 2,5 t" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Bestået", "Bestået m. bemærkning", "Ikke bestået"] },
        { key: "findings", label: "Observationer & opfølgning", type: "textarea", full: true,
          placeholder: "Beskriv forløb, evt. problemer og korrigerende handlinger …" },
      ]},
    ],
  },

  "Critical-supplier reassessment": {
    purpose: "Genvurder en kritisk leverandørs sikkerhedsniveau, kontrakt/DPA og fortsatte adgangsbehov.",
    est: "30–45 min pr. leverandør",
    sections: [
      { title: "Leverandør", fields: [
        { key: "supplier", label: "Leverandør", type: "text", placeholder: "Navn" },
        { key: "service", label: "Leveret ydelse", type: "text", placeholder: "fx hosting / MSP" },
        { key: "assessor", label: "Vurderet af", type: "text", placeholder: "Navn / rolle" },
        { key: "risk", label: "Risikoklasse", type: "select", options: ["Lav", "Middel", "Høj"] },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Kontrakt og databehandleraftale (DPA) er aktuel",
            "Sikkerhedscertificeringer gyldige (ISO 27001 / SOC 2)",
            "Underdatabehandlere gennemgået og godkendt",
            "Hændelseshistorik hos leverandøren gennemgået",
            "Adgang er stadig nødvendig og korrekt afgrænset",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Godkendt — fortsæt", "Godkendt med vilkår", "Optrapning / opsigelse"] },
        { key: "findings", label: "Fund & vilkår", type: "textarea", full: true,
          placeholder: "Noter mangler, aftalte vilkår eller opfølgning …" },
      ]},
    ],
  },

  "Awareness training (all staff + role-based)": {
    purpose: "Registrér gennemført sikkerhedstræning for alle medarbejdere samt rollespecifikke moduler.",
    est: "afhænger af rul-ud",
    sections: [
      { title: "Kampagne", fields: [
        { key: "period", label: "Træningsperiode", type: "text", placeholder: "fx feb–mar 2027" },
        { key: "method", label: "Leveringsform", type: "select",
          options: ["E-læring", "Fremmøde / workshop", "Kombination"] },
        { key: "completed", label: "Gennemført", type: "number", unit: "personer" },
        { key: "total", label: "Ud af i alt", type: "number", unit: "personer" },
      ]},
      { title: "Moduler gennemført", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Basismodul for alle medarbejdere",
            "Sikker udvikling (udviklere)",
            "IT/admin-specifikt modul",
            "Ledelsesmodul",
            "Phishing-simulering gennemført",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "phish", label: "Phishing-resultat", type: "text", placeholder: "fx 6 % klikrate" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Mål nået", "Delvist — opfølgning", "Ikke nået"] },
        { key: "findings", label: "Bemærkninger & opfølgning", type: "textarea", full: true,
          placeholder: "Manglende deltagere, genoptræning, næste kampagne …" },
      ]},
    ],
  },

  "Incident tabletop exercise": {
    purpose: "Gennemspil et hændelsesscenarie og test roller, eskalering, kommunikation og genopretning.",
    est: "1–2 timer",
    sections: [
      { title: "Øvelse", fields: [
        { key: "scenario", label: "Scenarie", type: "text", placeholder: "fx ransomware på filserver" },
        { key: "date", label: "Afholdt dato", type: "date" },
        { key: "participants", label: "Deltagere", type: "textarea", full: true,
          placeholder: "Navne og roller …" },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Roller og ansvar var klare",
            "Eskaleringsvej fungerede",
            "Kommunikationsplan blev testet (internt/eksternt)",
            "Detektion og logning var tilstrækkelig",
            "Genopretningstrin blev valideret",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Beredskab tilstrækkeligt", "Mindre forbedringer", "Væsentlige mangler"] },
        { key: "lessons", label: "Læringspunkter", type: "textarea", full: true,
          placeholder: "Hvad gik godt, hvad skal forbedres …" },
        { key: "actions", label: "Handlinger & ejere", type: "textarea", full: true,
          placeholder: "Konkrete opfølgningspunkter med ansvarlig og frist …" },
      ]},
    ],
  },

  "Risk assessment / risk-log review": {
    purpose: "Gennemgå risikoregistret for aktualitet, tilføj nye risici og bekræft at behandlingsplaner skrider frem.",
    est: "45–60 min",
    sections: [
      { title: "Gennemgang", fields: [
        { key: "period", label: "Periode", type: "text", placeholder: "fx 2027" },
        { key: "participants", label: "Deltagere", type: "text", placeholder: "ISO + risikoejere" },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Alle risici gennemgået for fortsat relevans",
            "Nye risici identificeret og tilføjet",
            "Behandlingsplaner er skredet frem",
            "Restrisiko fortsat acceptabel",
            "Risikoejere bekræftet",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "added", label: "Nye risici", type: "number", unit: "stk" },
        { key: "closed", label: "Lukkede risici", type: "number", unit: "stk" },
        { key: "topRisk", label: "Højeste restrisiko", type: "text", full: true,
          placeholder: "Kort beskrivelse …" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Risikobillede acceptabelt", "Opfølgning kræves", "Optrapning til ledelse"] },
        { key: "findings", label: "Bemærkninger", type: "textarea", full: true,
          placeholder: "Væsentlige ændringer i risikobilledet …" },
      ]},
    ],
  },

  "Management review of information security": {
    purpose: "Ledelsens årlige gennemgang af ISMS — input, beslutninger og ressourcer dokumenteres.",
    est: "60–90 min",
    sections: [
      { title: "Møde", fields: [
        { key: "date", label: "Mødedato", type: "date" },
        { key: "chair", label: "Mødeleder", type: "text", placeholder: "fx ISO" },
        { key: "attendees", label: "Deltagere", type: "textarea", full: true,
          placeholder: "Direktion og øvrige deltagere …" },
      ]},
      { title: "Dagsorden (input gennemgået)", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Status på handlinger fra forrige review",
            "Resultater fra audits/kontroller",
            "Tendenser i hændelser og afvigelser",
            "Resultat af risikovurdering",
            "Ressourcer og kompetencer tilstrækkelige",
            "Politik og mål fortsat egnede",
            "Muligheder for forbedring",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["ISMS velfungerende", "Forbedringer besluttet", "Væsentlige tiltag kræves"] },
        { key: "decisions", label: "Beslutninger", type: "textarea", full: true,
          placeholder: "Godkendelser, prioriteringer, ændringer …" },
        { key: "resources", label: "Godkendte ressourcer", type: "textarea", full: true,
          placeholder: "Budget, personer, værktøjer …" },
      ]},
    ],
  },

  "Patch-status review (critical systems)": {
    purpose: "Månedlig kontrol af at kritiske patches er installeret inden for SLA på alle kritiske systemer.",
    est: "15–20 min",
    sections: [
      { title: "Omfang", fields: [
        { key: "month", label: "Måned", type: "text", placeholder: "fx juli 2026" },
        { key: "reviewer", label: "Gennemgået af", type: "text", placeholder: "IT / MSP" },
        { key: "systems", label: "Systemer i omfang", type: "checklist", full: true,
          items: ["Servere", "Klienter/endpoints", "Netværksudstyr", "Kritiske applikationer"] },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Kritiske patches installeret inden for SLA",
            "Udestående patches har risikoaccept/begrundelse",
            "Ingen ikke-supporteret/EOL-software i produktion",
            "Sårbarhedsscanning gennemgået",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "pending", label: "Kritiske patches udestående", type: "number", unit: "stk" },
        { key: "oldest", label: "Ældste manglende patch", type: "text", placeholder: "fx 18 dage" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Alt inden for SLA", "Udestående m. risikoaccept", "SLA overskredet"] },
        { key: "findings", label: "Bemærkninger", type: "textarea", full: true,
          placeholder: "Udestående, undtagelser, opfølgning …" },
      ]},
    ],
  },

  "Policy review": {
    purpose: "Genvurder informationssikkerhedspolitikken for aktualitet og få den godkendt af ledelsen.",
    est: "30–45 min",
    sections: [
      { title: "Anledning", fields: [
        { key: "version", label: "Gennemgået version", type: "text", placeholder: "fx 0.2" },
        { key: "trigger", label: "Udløser", type: "select",
          options: ["Årlig gennemgang", "Ændring i drift", "Nyt lovkrav", "Efter hændelse"] },
        { key: "reviewer", label: "Gennemgået af", type: "text", placeholder: "Navn / rolle" },
      ]},
      { title: "Kontrolpunkter", fields: [
        { key: "checks", label: "Verificér", type: "checklist", full: true,
          items: [
            "Lov- og myndighedskrav vurderet (NIS2, GDPR m.fl.)",
            "Omfang og afgrænsning stadig korrekt",
            "Roller og ansvar aktuelle",
            "Referencer til procedurer er gyldige",
            "Godkendt af ledelsen",
          ]},
      ]},
      { title: "Resultat", fields: [
        { key: "changes", label: "Ændringer foretaget", type: "textarea", full: true,
          placeholder: "Beskriv ændringer i politikken …" },
        { key: "newVersion", label: "Ny version", type: "text", placeholder: "fx 1.0" },
        { key: "outcome", label: "Konklusion", type: "select",
          options: ["Uændret — genbekræftet", "Opdateret & godkendt", "Kræver ledelsesgodkendelse"] },
      ]},
    ],
  },
};

"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  addActivityEvidenceAction,
  removeActivityEvidenceAction,
  setActivityEffortAction,
  setActivityOwnerAction,
  setActivityPhaseAction,
  setActivityPriorityAction,
  setActivityStatusAction,
  setActivityTargetAction,
  setAdvisorNoteAction,
} from "@/lib/actions";
import type { Activity } from "@/lib/data/types";
import { EFFORTS, PHASES, PRIOS, STATUSES, dkDateToIso, prioMeta, statusMeta } from "@/lib/domain";

interface ActivityDrawerProps {
  activity: Activity;
  advNote: string;
  advisorInitials: string;
  advisorName: string;
  ownerOptions: string[];
}

export function ActivityDrawer({ activity: a, advNote, advisorInitials, advisorName, ownerOptions }: ActivityDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [evAdding, setEvAdding] = useState(false);
  const [evLabel, setEvLabel] = useState("");
  const [evUrl, setEvUrl] = useState("");
  const [note, setNote] = useState(advNote);

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sel");
    router.push(`${pathname}?${params.toString()}`);
  };

  const refresh = () => router.refresh();

  const btn = (active: boolean, activeStyle: string) =>
    `text-[11.5px] px-2.75 py-1.5 rounded-lg border cursor-pointer ${
      active ? `font-semibold ${activeStyle}` : "border-ck-border bg-white text-ck-muted-2"
    }`;

  const owners = ownerOptions.includes(a.owner) ? ownerOptions : [a.owner, ...ownerOptions];
  const canAddEvidence = evUrl.trim() !== "";

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(16,24,40,0.35)] z-40" onClick={close} />
      <div className="fixed top-0 right-0 bottom-0 w-[440px] max-w-[94vw] bg-white z-50 shadow-[0_0_40px_rgba(16,24,40,0.25)] overflow-auto">
        <div className="px-6 py-5 border-b border-ck-border flex items-start gap-3 sticky top-0 bg-white z-10">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[11px] text-ck-muted mb-1">{a.ref}</div>
            <div className="text-[15px] font-semibold text-ck-ink leading-snug">{a.action}</div>
            <div className="text-xs text-ck-muted mt-1">{a.area}</div>
          </div>
          <button onClick={close} className="text-2xl text-ck-muted leading-none px-1">
            ×
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-2">Prioritet</div>
            <div className="flex flex-wrap gap-1.5">
              {PRIOS.map((p) => {
                const active = p === a.priority;
                const m = prioMeta(p);
                return (
                  <button
                    key={p}
                    onClick={async () => {
                      await setActivityPriorityAction(a.ref, p);
                      refresh();
                    }}
                    className={btn(active, "")}
                    style={active ? { borderColor: m.solid ? m.bg : m.bar, background: m.bg, color: m.fg } : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-2">Fase</div>
            <div className="flex flex-wrap gap-1.5">
              {PHASES.map((ph) => {
                const active = ph === a.phase;
                return (
                  <button
                    key={ph}
                    onClick={async () => {
                      await setActivityPhaseAction(a.ref, ph);
                      refresh();
                    }}
                    className={btn(active, "")}
                    style={active ? { borderColor: "#3538cd", background: "#eef1fe", color: "#3538cd" } : undefined}
                  >
                    {ph}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-2">Indsats</div>
            <div className="flex flex-wrap gap-1.5">
              {(EFFORTS.includes(a.effort) ? EFFORTS : [a.effort, ...EFFORTS]).map((ef) => {
                const active = ef === a.effort;
                return (
                  <button
                    key={ef}
                    onClick={async () => {
                      await setActivityEffortAction(a.ref, ef);
                      refresh();
                    }}
                    className={`min-w-[34px] text-center ${btn(active, "")}`}
                    style={active ? { borderColor: "#101828", background: "#101828", color: "#fff" } : undefined}
                  >
                    {ef}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-2">Status</div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((st) => {
                const active = st === a.status;
                const m = statusMeta(st);
                return (
                  <button
                    key={st}
                    onClick={async () => {
                      await setActivityStatusAction(a.ref, st);
                      refresh();
                    }}
                    className={btn(active, "")}
                    style={active ? { borderColor: m.dot, background: m.bg, color: m.fg } : undefined}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Beskrivelse</div>
            <div className="text-xs text-ck-text-2 leading-relaxed">{a.desc}</div>
          </div>

          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Leverance</div>
            <div className="text-xs text-ck-text-2 leading-relaxed">{a.deliverable}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Ejer</div>
              <select
                defaultValue={a.owner}
                onChange={async (e) => {
                  await setActivityOwnerAction(a.ref, e.target.value);
                  refresh();
                }}
                className="w-full text-xs border border-ck-border rounded-lg px-2.5 py-2 bg-white"
              >
                {owners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Måldato</div>
              <input
                type="date"
                defaultValue={dkDateToIso(a.target)}
                onChange={async (e) => {
                  await setActivityTargetAction(a.ref, e.target.value);
                  refresh();
                }}
                className="w-full text-xs border border-ck-border rounded-lg px-2.5 py-2 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Afhængigheder</div>
              <div className="text-ck-text-2">{a.deps.length ? a.deps.join(", ") : "—"}</div>
            </div>
            <div>
              <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Politikreference</div>
              <div className="text-ck-text-2">{a.policyRef || "—"}</div>
            </div>
          </div>

          {a.tags.length > 0 && (
            <div>
              <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Standarder</div>
              <div className="flex flex-wrap gap-1.5">
                {a.tags.map((t) => (
                  <span
                    key={t.label}
                    className={`text-[11px] px-2.25 py-1 rounded-md border ${
                      t.gxp
                        ? "text-ck-violet-2 bg-ck-violet-bg border-ck-violet-border font-medium"
                        : "text-ck-text-2 bg-[#f2f4f7] border-ck-border"
                    }`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Noter</div>
            <div className="text-xs text-ck-text-2 leading-relaxed">{a.notes || "—"}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10.5px] tracking-wide uppercase text-ck-muted font-semibold">Evidens</div>
              <span className="text-[10px] text-ck-muted">MVP: kun links</span>
            </div>
            <div className="flex flex-col gap-1.5 mb-2">
              {(a.evidence ?? []).map((ev, i) => (
                <div key={`${ev.url}-${i}`} className="flex items-center gap-2 text-xs bg-[#fbfbfc] border border-ck-border rounded-lg px-2.5 py-1.5">
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-ck-indigo truncate flex-1">
                    {ev.label}
                  </a>
                  <button
                    onClick={async () => {
                      await removeActivityEvidenceAction(a.ref, i);
                      refresh();
                    }}
                    className="text-ck-muted hover:text-[#b42318]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {evAdding ? (
              <div className="flex flex-col gap-1.5">
                <input
                  value={evLabel}
                  onChange={(e) => setEvLabel(e.target.value)}
                  placeholder="Label (valgfri)"
                  className="text-xs border border-ck-border rounded-lg px-2.5 py-1.5"
                />
                <input
                  value={evUrl}
                  onChange={(e) => setEvUrl(e.target.value)}
                  placeholder="https://…"
                  className="text-xs border border-ck-border rounded-lg px-2.5 py-1.5"
                />
                <div className="flex gap-1.5">
                  <button
                    disabled={!canAddEvidence}
                    onClick={async () => {
                      await addActivityEvidenceAction(a.ref, evLabel, evUrl);
                      setEvAdding(false);
                      setEvLabel("");
                      setEvUrl("");
                      refresh();
                    }}
                    className={`text-xs font-medium rounded-lg px-3.5 py-1.5 ${canAddEvidence ? "text-white bg-ck-indigo" : "text-white bg-[#b6bdf0] cursor-not-allowed"}`}
                  >
                    Tilføj
                  </button>
                  <button
                    onClick={() => {
                      setEvAdding(false);
                      setEvLabel("");
                      setEvUrl("");
                    }}
                    className="text-xs text-ck-muted-2 px-3.5 py-1.5"
                  >
                    Annuller
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEvAdding(true)} className="text-xs text-ck-indigo font-medium">
                + Tilføj evidenslink
              </button>
            )}
          </div>

          <div className="border border-ck-violet-border bg-ck-violet-bg rounded-xl px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-white text-ck-violet-2 text-[9px] font-semibold flex items-center justify-center">
                {advisorInitials}
              </div>
              <div className="text-[11px] font-semibold text-ck-violet-2">Rådgiver-note ({advisorName})</div>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={async () => {
                await setAdvisorNoteAction(a.ref, note);
                refresh();
              }}
              rows={3}
              placeholder="Skriv en note til denne aktivitet…"
              className="w-full text-xs bg-white border border-ck-violet-border rounded-lg px-2.5 py-2 resize-none"
            />
          </div>
        </div>
      </div>
    </>
  );
}

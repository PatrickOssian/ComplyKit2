"use client";

import { useState } from "react";
import type { AdvisorIdentity, HelpGuide } from "@/lib/data/types";

interface HelpPanelProps {
  advisor: AdvisorIdentity;
  guides: HelpGuide[];
}

export function HelpPanel({ advisor, guides }: HelpPanelProps) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [centreOpen, setCentreOpen] = useState(false);
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const closeMsg = () => {
    setMsgOpen(false);
    setSubject("");
    setText("");
    setSent(false);
  };

  return (
    <>
      <div className="bg-white border border-ck-border rounded-xl px-5 py-4.5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-3">Your advisor</div>
        <div className="flex items-center gap-3.25">
          <div className="w-11 h-11 rounded-full shrink-0 bg-ck-indigo-bg text-ck-indigo text-sm font-semibold flex items-center justify-center">
            {advisor.initials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-ck-ink">
              {advisor.name} · {advisor.firm}
            </div>
            <div className="text-xs text-ck-muted">
              {advisor.role} · next review {advisor.nextReview} ·{" "}
              <a href={`tel:${advisor.phoneHref}`} className="text-ck-indigo">
                {advisor.phone}
              </a>
            </div>
          </div>
          <button onClick={() => setMsgOpen(true)} className="text-[12.5px] font-medium text-white bg-ck-indigo rounded-lg px-4 py-2.25">
            Message advisor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-white border border-ck-border rounded-xl px-4.5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[13px] font-semibold text-ck-ink mb-1.25">Documentation</div>
          <div className="text-xs text-ck-muted-2 leading-relaxed">
            Step-by-step guides for the policy editor, action plan and controlled documents.
          </div>
          <button onClick={() => setCentreOpen(true)} className="text-xs text-ck-indigo mt-2.5">
            Open help centre →
          </button>
        </div>
        <div className="bg-white border border-ck-border rounded-xl px-4.5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[13px] font-semibold text-ck-ink mb-1.25">Contact support</div>
          <div className="text-xs text-ck-muted-2 leading-relaxed">
            Email <span className="text-ck-indigo">support@complykit.eu</span> — we reply within one business day.
          </div>
          <div className="text-xs text-ck-indigo mt-2.5">Start a conversation →</div>
        </div>
      </div>

      {msgOpen && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50 flex items-center justify-center p-6" onClick={closeMsg}>
            <div onClick={(e) => e.stopPropagation()} className="w-[480px] max-w-full bg-white rounded-2xl shadow-[0_24px_60px_rgba(16,24,40,0.24)] overflow-hidden">
              {!sent ? (
                <>
                  <div className="flex items-start gap-3 px-5.5 py-5 border-b border-ck-border">
                    <div className="w-10 h-10 rounded-full shrink-0 bg-ck-indigo-bg text-ck-indigo text-[13px] font-semibold flex items-center justify-center">
                      {advisor.initials}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-ck-ink">Message {advisor.name}</div>
                      <div className="text-xs text-ck-muted mt-0.5">
                        {advisor.firm} · {advisor.role} · replies within one business day
                      </div>
                    </div>
                    <button onClick={closeMsg} className="text-xl text-ck-muted leading-none px-1">
                      ×
                    </button>
                  </div>
                  <div className="px-5.5 pt-3.5">
                    <a href={`tel:${advisor.phoneHref}`} className="flex items-center gap-2.25 bg-ck-page border border-ck-border rounded-lg px-3 py-2.5">
                      <span className="text-sm text-ck-indigo">☎</span>
                      <div className="flex-1">
                        <div className="text-[11px] text-ck-muted">Prefer to call?</div>
                        <div className="text-[13px] font-medium text-ck-indigo">{advisor.phone}</div>
                      </div>
                    </a>
                  </div>
                  <div className="px-5.5 py-5">
                    <div className="text-xs text-ck-text-2 mb-1.5">Subject</div>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What is this about?"
                      className="w-full box-border border border-ck-border-2 rounded-lg px-3 py-2.5 text-[13px] text-ck-ink outline-none mb-3.5"
                    />
                    <div className="text-xs text-ck-text-2 mb-1.5">Message</div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write your message to your advisor…"
                      className="w-full box-border border border-ck-border-2 rounded-lg px-3 py-2.5 text-[13px] text-ck-ink outline-none min-h-[130px] resize-y"
                    />
                    <div className="flex gap-2.5 mt-4.5">
                      <button onClick={closeMsg} className="shrink-0 text-center text-[13px] font-medium text-ck-text-2 bg-white border border-ck-border-2 rounded-lg px-4.5 py-2.75">
                        Cancel
                      </button>
                      <button
                        onClick={() => text.trim() && setSent(true)}
                        disabled={!text.trim()}
                        className={`flex-1 text-center text-[13px] font-medium rounded-lg py-2.75 text-white ${text.trim() ? "bg-ck-indigo" : "bg-[#b6bdf0] cursor-not-allowed"}`}
                      >
                        Send message
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-7 py-9 text-center">
                  <div className="w-13 h-13 rounded-full bg-ck-accent-bg text-ck-accent text-2xl flex items-center justify-center mx-auto mb-4">
                    ✓
                  </div>
                  <div className="text-base font-semibold text-ck-ink mb-1.5">Message sent</div>
                  <div className="text-[13px] text-ck-muted-2 leading-relaxed max-w-[320px] mx-auto mb-5.5">
                    {advisor.name} at {advisor.firm} has received your message and will reply within one business day.
                  </div>
                  <button onClick={closeMsg} className="inline-block text-center text-[13px] font-medium text-white bg-ck-ink rounded-lg px-5.5 py-2.5">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {centreOpen && (
        <div
          className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50 flex items-center justify-center p-6"
          onClick={() => setCentreOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[620px] max-w-full max-h-[86vh] bg-white rounded-2xl shadow-[0_24px_60px_rgba(16,24,40,0.24)] overflow-hidden flex flex-col"
          >
            <div className="flex items-start gap-3 px-5.5 py-5 border-b border-ck-border">
              <div className="flex-1">
                <div className="text-base font-semibold text-ck-ink">Help centre</div>
                <div className="text-[12.5px] text-ck-muted mt-0.5">
                  Step-by-step guides for the policy editor, action plan and controlled documents
                </div>
              </div>
              <button onClick={() => setCentreOpen(false)} className="text-xl text-ck-muted leading-none px-1">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5.5 pt-2 pb-5">
              {guides.map((g) => {
                const open = openGuide === g.id;
                return (
                  <div key={g.id} className="border border-ck-border rounded-xl overflow-hidden mt-3">
                    <button
                      onClick={() => setOpenGuide(open ? null : g.id)}
                      className="w-full flex items-start gap-3 px-4 py-3.75 text-left"
                    >
                      <div
                        className="w-7.5 h-7.5 rounded-lg shrink-0 flex items-center justify-center text-sm font-semibold"
                        style={{ background: open ? "#3538cd" : "#eef1fe", color: open ? "#fff" : "#3538cd" }}
                      >
                        {g.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13.5px] font-semibold text-ck-ink">{g.title}</div>
                        <div className="text-xs text-ck-muted-2 leading-relaxed mt-0.5">{g.desc}</div>
                      </div>
                      <div className="text-ck-muted text-[13px] shrink-0 mt-0.5">{open ? "▾" : "▸"}</div>
                    </button>
                    {open && (
                      <div className="pl-14.5 pr-4.5 pb-4.5">
                        {g.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2.75 py-1.75">
                            <div className="w-5.5 h-5.5 rounded-full shrink-0 bg-ck-indigo-bg text-ck-indigo text-[11px] font-semibold flex items-center justify-center">
                              {i + 1}
                            </div>
                            <div className="text-[12.5px] text-ck-text-3 leading-relaxed pt-0.25">{step}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

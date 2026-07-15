"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  publishDocumentAction,
  reopenDocumentAction,
  sendDocumentToReviewAction,
  setDocumentApproverAction,
  setDocumentBodyAction,
  setDocumentOwnerAction,
  setDocumentReviewAction,
  setDocumentStageAction,
  setDocumentTitleAction,
  signDocumentAction,
} from "@/lib/actions";
import type { ControlledDocument, DocLifecycleStage } from "@/lib/data/types";
import { DOCSTAGES, docStageMeta, stageRowMeta } from "@/lib/domain";
import { htmlToText, textToHtml } from "@/lib/markdown";

const REVIEW_CYCLES = ["Annual (or on change)", "Annual", "Semi-annual", "Quarterly", "On change only", "Biennial"];
const GXP_FRAMEWORKS = ["EU GMP Annex 11", "21 CFR Part 11", "GAMP 5", "ALCOA+", "GxP"];

interface DocumentDrawerProps {
  doc: ControlledDocument;
  ownerOptions: string[];
}

export function DocumentDrawer({ doc: d, ownerOptions }: DocumentDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState(d.title);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [signKind, setSignKind] = useState<"review" | "approve" | null>(null);
  const [signName, setSignName] = useState("");

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sel");
    router.push(`${pathname}?${params.toString()}`);
  };
  const refresh = () => router.refresh();

  const owners = ownerOptions.includes(d.owner) ? ownerOptions : [d.owner, ...ownerOptions];
  const approvers = ownerOptions.includes(d.approver) ? ownerOptions : [d.approver, ...ownerOptions];
  const reviewOpts = REVIEW_CYCLES.includes(d.review) ? REVIEW_CYCLES : [d.review, ...REVIEW_CYCLES];

  const showEdit = (d.docStage === "Not started" || d.docStage === "Drafting") && !d.reviewSig && !d.approveSig && !editing;
  const canSendReview = (d.docStage === "Not started" || d.docStage === "Drafting") && !editing;
  const canSignReview = d.docStage === "In review" && !d.reviewSig;
  const canSignApprove = !!d.reviewSig && !d.approveSig;
  const waitApprove = !d.reviewSig && !d.approveSig && d.docStage !== "Not started" && d.docStage !== "Drafting";
  const canPublish = d.docStage === "Approved" && !!d.approveSig;
  const canReopen = d.docStage === "In review" || d.docStage === "Approved" || d.docStage === "Published";

  const startEdit = () => {
    setEditText(htmlToText(d.body || ""));
    setEditing(true);
  };
  const saveEdit = async () => {
    await setDocumentBodyAction(d.num, textToHtml(editText));
    setEditing(false);
    refresh();
  };

  const confirmSign = async () => {
    if (!signKind || !signName.trim()) return;
    await signDocumentAction(d.num, signKind, signName);
    setSignKind(null);
    setSignName("");
    refresh();
  };

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(16,24,40,0.35)] z-40" onClick={close} />
      <div className="fixed top-0 right-0 bottom-0 w-[520px] max-w-[94vw] bg-white z-50 shadow-[-8px_0_32px_rgba(16,24,40,0.18)] flex flex-col">
        <div className="flex items-start gap-3 px-5.5 py-5 border-b border-ck-border">
          <div className="flex-1">
            <div className="font-mono text-[11px] text-ck-muted mb-1">
              Dokument #{d.num} · {d.type}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={async () => {
                await setDocumentTitleAction(d.num, title);
                refresh();
              }}
              placeholder="Document title"
              className="w-full text-base font-semibold text-ck-ink leading-snug border-none outline-none bg-transparent -mx-1 px-1 rounded-md focus:bg-ck-page"
            />
          </div>
          <button onClick={close} className="text-xl text-ck-muted leading-none px-1">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5.5 py-5">
          <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Livscyklus-stadie</div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {DOCSTAGES.map((st) => {
              const active = st === d.docStage;
              const m = docStageMeta(st);
              return (
                <button
                  key={st}
                  onClick={async () => {
                    await setDocumentStageAction(d.num, st as DocLifecycleStage);
                    refresh();
                  }}
                  className="text-[11.5px] px-2.75 py-1.5 rounded-lg border"
                  style={active ? { borderColor: m.dot, background: m.bg, color: m.fg, fontWeight: 600 } : { borderColor: "#eaecf0", background: "#fff", color: "#667085" }}
                >
                  {m.da}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="text-[11px] text-ck-muted mb-1">Ejer</div>
              <select
                defaultValue={d.owner}
                onChange={async (e) => {
                  await setDocumentOwnerAction(d.num, e.target.value);
                  refresh();
                }}
                className="w-full text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2 py-1.5 bg-white"
              >
                {owners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[11px] text-ck-muted mb-1">Godkender</div>
              <select
                defaultValue={d.approver}
                onChange={async (e) => {
                  await setDocumentApproverAction(d.num, e.target.value);
                  refresh();
                }}
                className="w-full text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2 py-1.5 bg-white"
              >
                {approvers.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[11px] text-ck-muted mb-1">Politik-reference</div>
              <div className="text-xs text-ck-ink">{d.policyRef}</div>
            </div>
            <div>
              <div className="text-[11px] text-ck-muted mb-1">Review-cyklus</div>
              <select
                defaultValue={d.review}
                onChange={async (e) => {
                  await setDocumentReviewAction(d.num, e.target.value);
                  refresh();
                }}
                className="w-full text-xs text-ck-ink border border-ck-border-2 rounded-lg px-2 py-1.5 bg-white"
              >
                {reviewOpts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-1.5">Rammeværk</div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {d.frameworks.map((f) => (
              <span
                key={f}
                className={`text-[11px] px-2 py-0.75 rounded-md border ${
                  GXP_FRAMEWORKS.includes(f) ? "text-ck-violet-2 bg-ck-violet-bg border-ck-violet-border" : "text-ck-text-2 bg-[#f2f4f7] border-ck-border"
                }`}
              >
                {f}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold">Document · draft v{d.version}</div>
            {showEdit && (
              <button onClick={startEdit} className="ml-auto text-[11.5px] font-medium text-ck-indigo bg-ck-indigo-bg border border-ck-indigo-border rounded-lg px-2.75 py-1">
                ✎ Edit
              </button>
            )}
            {d.docStage === "Published" && (
              <span className="ml-auto text-[10.5px] text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2.25 py-0.75 rounded-full">
                Effective {d.effective}
              </span>
            )}
          </div>
          {editing ? (
            <>
              <div className="text-[10.5px] text-ck-muted mb-2">
                Formatting: <b className="font-semibold">## heading</b> · <b className="font-semibold">- bullet</b> ·{" "}
                <b className="font-semibold">1. numbered</b> · <b className="font-semibold">**bold**</b>
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                spellCheck={false}
                className="w-full h-[360px] box-border border border-ck-indigo rounded-xl bg-white px-4 py-3.5 text-[12.5px] text-ck-text-3 leading-relaxed outline-none resize-y"
              />
              <div className="flex gap-2 my-2.5 mb-5.5">
                <button onClick={saveEdit} className="text-[12.5px] font-medium text-white bg-ck-indigo rounded-lg px-4 py-2.25">
                  Save changes
                </button>
                <button onClick={() => setEditing(false)} className="text-[12.5px] font-medium text-ck-text-2 bg-white border border-ck-border-2 rounded-lg px-4 py-2.25">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="border border-ck-border rounded-lg px-4 py-3.5 text-[12.5px] text-ck-text-3 leading-relaxed bg-[#fbfbfc] max-h-[360px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: d.body || '<p style="color:#98a2b3">No draft content yet.</p>' }}
              />
              <div className="h-5.5" />
            </>
          )}

          <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-2">Review &amp; approval</div>
          <div className="border border-ck-border rounded-xl overflow-hidden mb-3">
            <div className="flex items-center gap-2.75 px-3.5 py-3">
              <div
                className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                style={{ color: d.reviewSig ? "#fff" : "#667085", background: d.reviewSig ? "#12b76a" : "#f2f4f7" }}
              >
                {d.reviewSig ? "✓" : "1"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ck-ink">Reviewer sign-off</div>
                <div className="text-[11px] text-ck-muted">
                  {d.reviewSig ? `${d.reviewSig.name} · ${d.reviewSig.when}` : `Expected reviewer: ${d.owner}`}
                </div>
              </div>
              {canSignReview && (
                <button
                  onClick={() => {
                    setSignKind("review");
                    setSignName("");
                  }}
                  className="text-[11.5px] font-medium text-white bg-ck-indigo rounded-lg px-3 py-1.5 whitespace-nowrap"
                >
                  Sign as reviewer
                </button>
              )}
              {d.reviewSig && (
                <span className="text-[10.5px] text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2.25 py-0.75 rounded-full whitespace-nowrap">
                  Signed
                </span>
              )}
            </div>
            <div className="h-px bg-[#f2f4f7]" />
            <div className="flex items-center gap-2.75 px-3.5 py-3">
              <div
                className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                style={{ color: d.approveSig ? "#fff" : "#667085", background: d.approveSig ? "#12b76a" : "#f2f4f7" }}
              >
                {d.approveSig ? "✓" : "2"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ck-ink">Approver sign-off</div>
                <div className="text-[11px] text-ck-muted">
                  {d.approveSig ? `${d.approveSig.name} · ${d.approveSig.when}` : `Expected approver: ${d.approver}`}
                </div>
              </div>
              {canSignApprove && (
                <button
                  onClick={() => {
                    setSignKind("approve");
                    setSignName("");
                  }}
                  className="text-[11.5px] font-medium text-white bg-ck-violet rounded-lg px-3 py-1.5 whitespace-nowrap"
                >
                  Approve &amp; sign
                </button>
              )}
              {waitApprove && <span className="text-[10.5px] text-ck-muted whitespace-nowrap">Awaiting review</span>}
              {d.approveSig && (
                <span className="text-[10.5px] text-[#067647] bg-ck-accent-bg border border-ck-accent-border px-2.25 py-0.75 rounded-full whitespace-nowrap">
                  Signed
                </span>
              )}
            </div>
          </div>

          {signKind && (
            <div className="border border-ck-indigo-border bg-[#fbfbff] rounded-xl p-3.5 mb-3">
              <div className="flex items-center gap-1.75 mb-2">
                <span className="text-[9px] font-semibold tracking-wide text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1.75 py-0.5 rounded">
                  E-SIGNATURE
                </span>
                <span className="text-[12.5px] font-semibold text-ck-ink">
                  {signKind === "approve" ? "Approver sign-off" : "Reviewer sign-off"}
                </span>
              </div>
              <div className="text-[11.5px] text-ck-muted-2 mb-2.5">
                Meaning —{" "}
                {signKind === "approve"
                  ? "Approved — authorised for release / effective use"
                  : "Reviewed — checked for accuracy & completeness"}
              </div>
              <input
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
                placeholder="Type your full name to sign"
                className="w-full border border-ck-border-2 rounded-lg px-2.75 py-2.25 text-[12.5px] text-ck-ink outline-none mb-2"
              />
              <div className="text-[10.5px] text-ck-muted-2 leading-relaxed bg-white border border-ck-border rounded-lg px-2.75 py-2.25 mb-2.5">
                I certify that this electronic signature is the legally binding equivalent of my handwritten signature,
                applied to draft v{d.version} with the meaning above.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={confirmSign}
                  disabled={!signName.trim()}
                  className={`flex-1 text-center text-[12.5px] font-medium rounded-lg py-2.25 text-white ${signName.trim() ? "bg-ck-indigo" : "bg-[#b6bdf0] cursor-not-allowed"}`}
                >
                  Sign now
                </button>
                <button
                  onClick={() => setSignKind(null)}
                  className="text-center text-[12.5px] font-medium text-ck-text-2 bg-white border border-ck-border-2 rounded-lg px-4 py-2.25"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mb-5.5">
            {canSendReview && (
              <button
                onClick={async () => {
                  await sendDocumentToReviewAction(d.num);
                  refresh();
                }}
                className="text-xs font-medium text-white bg-ck-ink rounded-lg px-3.5 py-2"
              >
                Send to review →
              </button>
            )}
            {canPublish && (
              <button
                onClick={async () => {
                  await publishDocumentAction(d.num);
                  refresh();
                }}
                className="text-xs font-medium text-white bg-ck-accent rounded-lg px-3.5 py-2"
              >
                Publish
              </button>
            )}
            {canReopen && (
              <button
                onClick={async () => {
                  await reopenDocumentAction(d.num);
                  refresh();
                }}
                className="text-xs font-medium text-ck-text-2 bg-white border border-ck-border-2 rounded-lg px-3.5 py-2"
              >
                Reopen for editing (new version)
              </button>
            )}
          </div>

          <div className="text-[11px] tracking-wide uppercase text-ck-muted font-semibold mb-2">Stadier (Appendix B)</div>
          {d.stages.map((s) => {
            const rm = stageRowMeta(s.status);
            const sm = docStageMeta(s.status);
            return (
              <div key={s.ref} className="border border-ck-border rounded-lg px-3.5 py-3 mb-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="text-[12.5px] font-semibold text-ck-ink">{s.stage}</div>
                  <span className="inline-flex items-center gap-1.25 text-[11px]" style={{ color: rm.fg }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: rm.dot }} />
                    {sm.da}
                  </span>
                  <span className="ml-auto text-[10.5px] text-ck-muted">{s.phase}</span>
                </div>
                <div className="text-[11.5px] text-ck-text-2 leading-relaxed mb-1.5">{s.scope}</div>
                <div className="text-[10.5px] text-ck-muted">Leverance: {s.deliverable}</div>
                <div className="text-[10.5px] text-ck-muted mt-0.75 font-mono">↔ Handlingsplan: {s.linkedA.join(", ") || "—"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

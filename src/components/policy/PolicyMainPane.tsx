"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  publishPolicyAction,
  removePolicySectionAction,
  reopenPolicyAction,
  sendPolicyToReviewAction,
  setPolicyBumpKindAction,
  setPolicyOwnerAction,
  setPolicySectionBodyAction,
  setPolicySectionTitleAction,
  signPolicyAction,
} from "@/lib/actions";

interface PolicyMainPaneProps {
  curNum: number;
  curTitle: string;
  curGxp?: boolean;
  curCustom: boolean;
  bodyParagraphs: string[];
  bodyText: string;
  editable: boolean;
  statusLabel: string;
  statusFg: string;
  statusBg: string;
  statusDot: string;
  version: string;
  validFrom: string;
  owner: string;
  approvedBy: string;
  reviewSigText: string;
  approveSigText: string;
  hasReviewSig: boolean;
  hasApproveSig: boolean;
  updating: boolean;
  nextVerHint: string;
  bumpKind: "minor" | "major";
  canSendReview: boolean;
  canSignReview: boolean;
  canSignApprove: boolean;
  canPublish: boolean;
  canReopen: boolean;
  disclaimer: string;
}

export function PolicyMainPane({
  curNum,
  curTitle,
  curGxp,
  curCustom,
  bodyParagraphs,
  bodyText,
  editable,
  statusLabel,
  statusFg,
  statusBg,
  statusDot,
  version,
  validFrom,
  owner: ownerProp,
  approvedBy,
  reviewSigText,
  approveSigText,
  hasReviewSig,
  hasApproveSig,
  updating,
  nextVerHint,
  bumpKind,
  canSendReview,
  canSignReview,
  canSignApprove,
  canPublish,
  canReopen,
  disclaimer,
}: PolicyMainPaneProps) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [owner, setOwner] = useState(ownerProp);
  const [title, setTitle] = useState(curTitle);
  const [text, setText] = useState(bodyText);
  const [signKind, setSignKind] = useState<"review" | "approve" | null>(null);
  const [signName, setSignName] = useState("");

  const confirmSign = async () => {
    if (!signKind || !signName.trim()) return;
    await signPolicyAction(signKind, signName);
    setSignKind(null);
    setSignName("");
    refresh();
  };

  const bumpPillClass = (on: boolean) =>
    `text-[10.5px] font-semibold px-2.25 py-1 rounded-full border cursor-pointer ${on ? "border-ck-indigo text-ck-indigo bg-ck-indigo-bg" : "border-ck-border text-ck-muted bg-white"}`;

  const actionBtn = "text-xs font-medium text-white rounded-lg px-3.5 py-2 whitespace-nowrap";

  return (
    <div className="flex-1 overflow-auto px-8.5 py-6.5 pb-15 max-w-[820px]">
      <div className="bg-white border border-ck-border rounded-xl px-4.25 py-3.75 mb-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-wrap items-center gap-3.5 text-[11.5px] text-ck-text-2">
          <div className="flex items-center gap-1.75">
            <span className="text-ck-muted">Status</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.75 rounded-full" style={{ color: statusFg, background: statusBg }}>
              <span className="w-1.75 h-1.75 rounded-full" style={{ background: statusDot }} />
              {statusLabel}
            </span>
          </div>
          <div>
            <span className="text-ck-muted">Version</span> <b className="text-ck-ink font-semibold font-mono">{version}</b>
          </div>
          <div>
            <span className="text-ck-muted">Gyldig fra</span> <b className="text-ck-ink font-semibold">{validFrom}</b>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ck-muted">Ejer</span>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              onBlur={async () => {
                await setPolicyOwnerAction(owner);
                refresh();
              }}
              className="text-[11.5px] font-semibold text-ck-ink border border-ck-border rounded-md px-2 py-0.75 outline-none w-[118px]"
            />
          </div>
          <div>
            <span className="text-ck-muted">Godkendt af</span> <b className="text-ck-ink font-semibold">{approvedBy}</b>
          </div>
        </div>
        <div className="border-t border-[#f2f4f7] mt-3.5 pt-3.5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                style={{ color: hasReviewSig ? "#fff" : "#98a2b3", background: hasReviewSig ? "#12b76a" : "#f2f4f7" }}
              >
                {hasReviewSig ? "✓" : "1"}
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-semibold text-ck-ink">Reviewer</div>
                <div className="text-[10px] text-ck-muted">{reviewSigText}</div>
              </div>
            </div>
            <div className="w-5 h-px bg-[#e4e7ec]" />
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                style={{ color: hasApproveSig ? "#fff" : "#98a2b3", background: hasApproveSig ? "#12b76a" : "#f2f4f7" }}
              >
                {hasApproveSig ? "✓" : "2"}
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-semibold text-ck-ink">Godkender</div>
                <div className="text-[10px] text-ck-muted">{approveSigText}</div>
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2.25 flex-wrap">
            {updating && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] text-ck-muted">Opdatering</span>
                <button
                  onClick={async () => {
                    await setPolicyBumpKindAction("minor");
                    refresh();
                  }}
                  className={bumpPillClass(bumpKind !== "major")}
                >
                  Mindre +0.1
                </button>
                <button
                  onClick={async () => {
                    await setPolicyBumpKindAction("major");
                    refresh();
                  }}
                  className={bumpPillClass(bumpKind === "major")}
                >
                  Større +1.0
                </button>
              </div>
            )}
            {canSendReview && (
              <button
                onClick={async () => {
                  await sendPolicyToReviewAction();
                  refresh();
                }}
                className={`${actionBtn} bg-ck-indigo`}
              >
                Send til review →
              </button>
            )}
            {canSignReview && (
              <button
                onClick={() => {
                  setSignKind("review");
                  setSignName("");
                }}
                className={`${actionBtn} bg-ck-indigo`}
              >
                Skriv under som reviewer
              </button>
            )}
            {canSignApprove && (
              <button
                onClick={() => {
                  setSignKind("approve");
                  setSignName("");
                }}
                className={`${actionBtn} bg-ck-indigo`}
              >
                Godkend &amp; skriv under
              </button>
            )}
            {canPublish && (
              <button
                onClick={async () => {
                  await publishPolicyAction();
                  refresh();
                }}
                className={`${actionBtn} bg-ck-accent`}
              >
                Publicér politik →
              </button>
            )}
            {canReopen && (
              <button
                onClick={async () => {
                  await reopenPolicyAction();
                  refresh();
                }}
                className="text-xs font-medium text-ck-text-2 bg-white border border-ck-border-2 rounded-lg px-3.5 py-2 whitespace-nowrap"
              >
                Opdatér politik
              </button>
            )}
          </div>
        </div>
        {nextVerHint && <div className="text-[10.5px] text-ck-muted mt-2.25">{nextVerHint}</div>}
      </div>

      <div className="flex items-center gap-2.5 mb-4.5">
        <div className="font-mono text-xl text-ck-muted">{curNum}</div>
        {editable ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={async () => {
                await setPolicySectionTitleAction(curNum, title, curCustom);
                refresh();
              }}
              placeholder="Afsnitstitel"
              className="flex-1 min-w-0 text-[22px] font-semibold text-ck-ink tracking-tight border border-transparent hover:border-ck-border focus:border-ck-border-2 rounded-lg px-1.5 py-0.5 outline-none"
            />
            {curCustom && (
              <button
                onClick={async () => {
                  await removePolicySectionAction(curNum);
                  refresh();
                }}
                title="Slet afsnit"
                className="shrink-0 text-xs text-ck-muted border border-ck-border rounded-lg px-2.5 py-1.25"
              >
                Slet
              </button>
            )}
          </>
        ) : (
          <div className="text-[22px] font-semibold text-ck-ink tracking-tight">{curTitle}</div>
        )}
        {curGxp && (
          <span className="text-[10px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-2 py-0.75 rounded-md">
            GxP-afsnit
          </span>
        )}
      </div>

      {editable ? (
        <>
          <div className="text-[11px] text-[#b54708] bg-[#fffaeb] border border-[#fedf89] rounded-lg px-3 py-2 mb-3">
            Redigering aktiv — politikken er i kladde. Naviger mellem afsnittene i venstre side for at redigere hele
            politikken. Teksten låses igen når du trykker &quot;Send til review&quot;.
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={async () => {
              await setPolicySectionBodyAction(curNum, text);
              refresh();
            }}
            className="w-full min-h-[360px] box-border text-[13.5px] text-ck-text-3 leading-relaxed bg-white border border-ck-border-2 rounded-xl px-4 py-3.5 outline-none resize-y"
          />
          <div className="text-[10.5px] text-ck-muted mt-2">Adskil afsnit med en tom linje.</div>
        </>
      ) : (
        bodyParagraphs.map((p, i) => (
          <div key={i} className="text-[13.5px] text-ck-text-3 leading-relaxed mb-2.75">
            {p}
          </div>
        ))
      )}

      <div className="text-[10.5px] text-ck-muted mt-6 border-t border-[#f2f4f7] pt-3.5">
        Redigering pr. afsnit med versionsstempel ved gem (rich-text). Fuld track-changes er uden for MVP. {disclaimer}
      </div>

      {signKind && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50" onClick={() => setSignKind(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[410px] max-w-[92vw] bg-white rounded-2xl z-50 shadow-[0_20px_60px_rgba(16,24,40,0.3)] p-5.5">
            <div className="text-[15px] font-semibold text-ck-ink mb-1.25">
              {signKind === "approve" ? "Godkender-underskrift" : "Reviewer-underskrift"}
            </div>
            <div className="text-xs text-ck-muted-2 leading-relaxed mb-4">
              {signKind === "approve"
                ? "Godkendt — autoriseret til udgivelse og ikrafttrædelse."
                : "Gennemgået — kontrolleret for korrekthed og fuldstændighed."}
            </div>
            <div className="text-[11px] text-ck-muted mb-1.25">Dit navn</div>
            <input
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              placeholder="Fx J. Mikkelsen (Direktionen)"
              className="w-full box-border text-[13px] text-ck-ink border border-ck-border-2 rounded-lg px-2.75 py-2.25 outline-none mb-2"
            />
            <div className="text-[10.5px] text-ck-muted mb-4">
              Underskrift stemples med: {new Date().toLocaleString("da-DK")}
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setSignKind(null)} className="shrink-0 text-[13px] text-ck-text-2 border border-ck-border-2 rounded-lg px-4 py-2.25">
                Annullér
              </button>
              <button
                onClick={confirmSign}
                disabled={!signName.trim()}
                className={`flex-1 text-center text-[13px] font-medium rounded-lg py-2.25 text-white ${signName.trim() ? "bg-ck-indigo" : "bg-[#b6bdf0] cursor-not-allowed"}`}
              >
                Skriv under
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

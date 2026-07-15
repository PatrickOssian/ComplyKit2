import { PolicyMainPane } from "@/components/policy/PolicyMainPane";
import { PolicySectionRail } from "@/components/policy/PolicySectionRail";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";
import { disclaimer } from "@/lib/data/seed";
import { docStageMeta } from "@/lib/domain";
import type { DocLifecycleStage, PolicyStage } from "@/lib/data/types";

interface PolicyPageProps {
  searchParams: Promise<{ sel?: string }>;
}

const STAGE_MAP: Record<PolicyStage, DocLifecycleStage> = {
  Kladde: "Drafting",
  "I review": "In review",
  Godkendt: "Approved",
  Publiceret: "Published",
};

export default async function PolicyPage({ searchParams }: PolicyPageProps) {
  const sp = await searchParams;
  const { session, advisor, bucket } = await requireAppContext();

  const allSections = [...bucket.policySections, ...bucket.policyCustomSections].map((s) => ({
    ...s,
    title: bucket.policyTitleEdits[s.num] ?? s.title,
  }));
  const secs = allSections.filter((s) => session.gxp || !s.gxp);

  const selNum = sp.sel ? Number(sp.sel) : secs[0]?.num;
  let cur = secs.find((s) => s.num === selNum);
  if (!cur) cur = secs[0];

  const p = bucket.policyState;
  const editable = p.stage === "Kladde";
  const origText = cur.body.join("\n\n");
  const curText = bucket.policyEdits[cur.num] ?? origText;
  const bodyParagraphs = curText.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);

  const sm = docStageMeta(STAGE_MAP[p.stage]);
  const updating = !!p.publishedVersion && p.stage !== "Publiceret";
  const lastPub = p.history[0] ?? null;
  const displayVersion = p.publishedVersion || p.version || "0.2";
  const approvedBy = p.approveSig ? p.approveSig.name : lastPub ? lastPub.approvedBy : "—";
  let statusLabel: string = p.stage;
  if (updating) statusLabel = `${p.stage} · opdatering`;

  let nextVerHint = "";
  if (updating && p.publishedVersion) {
    const [majStr, minStr] = p.publishedVersion.split(".");
    const maj = parseInt(majStr, 10) || 1;
    const min = parseInt(minStr, 10) || 0;
    const nv = p.bumpKind === "major" ? `${maj + 1}.0` : `${maj}.${min + 1}`;
    nextVerHint = `Ved næste publicering bliver versionen ${nv}.`;
  }

  const canSendReview = p.stage === "Kladde";
  const canSignReview = p.stage === "I review" && !p.reviewSig;
  const canSignApprove = !!p.reviewSig && !p.approveSig;
  const canPublish = p.stage === "Godkendt" && !!p.approveSig;
  const canReopen = p.stage === "Publiceret";

  return (
    <PageShell
      title="Informationssikkerhedspolitik"
      subtitle={`${secs.length} afsnit${session.gxp ? " · GxP-afsnit synlige" : " · GxP-afsnit skjult"}`}
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="flex h-full">
        <PolicySectionRail sections={secs.map((s) => ({ num: s.num, title: s.title, gxp: s.gxp }))} currentSel={cur.num} />
        <PolicyMainPane
          key={cur.num}
          curNum={cur.num}
          curTitle={cur.title}
          curGxp={cur.gxp}
          curCustom={!!cur.custom}
          bodyParagraphs={bodyParagraphs}
          bodyText={curText}
          editable={editable}
          statusLabel={statusLabel}
          statusFg={sm.fg}
          statusBg={sm.bg}
          statusDot={sm.dot}
          version={displayVersion}
          validFrom={p.validFrom || "—"}
          owner={p.owner || "Direktionen"}
          approvedBy={approvedBy}
          reviewSigText={p.reviewSig ? `${p.reviewSig.name} · ${p.reviewSig.when}` : "Afventer review"}
          approveSigText={p.approveSig ? `${p.approveSig.name} · ${p.approveSig.when}` : "Afventer godkendelse"}
          hasReviewSig={!!p.reviewSig}
          hasApproveSig={!!p.approveSig}
          updating={updating}
          nextVerHint={nextVerHint}
          bumpKind={p.bumpKind}
          canSendReview={canSendReview}
          canSignReview={canSignReview}
          canSignApprove={canSignApprove}
          canPublish={canPublish}
          canReopen={canReopen}
          disclaimer={disclaimer}
        />
      </div>
    </PageShell>
  );
}

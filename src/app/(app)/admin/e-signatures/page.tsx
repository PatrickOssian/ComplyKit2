import { ESignPanel } from "@/components/admin/ESignPanel";
import { PageShell } from "@/components/shell/PageShell";
import { requireAppContext } from "@/lib/app-context";

export default async function AdminESignaturesPage() {
  const { session, advisor, bucket } = await requireAppContext();

  return (
    <PageShell title="Elektroniske signaturer" subtitle="21 CFR Part 11 · EU GMP Annex 11" gxpOn={session.gxp} advisor={advisor}>
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="text-xs text-ck-text-2 bg-white border border-ck-border rounded-lg px-3.5 py-2.75 mb-5">
          Electronic signatures captured here satisfy 21 CFR Part 11 and EU GMP Annex 11 requirements — each is bound
          to a stated meaning, a re-authenticated identity, and a timestamp, and is logged to the audit trail.
        </div>
        <ESignPanel pending={bucket.pendingSignatures} signed={bucket.signedRecords} />
      </div>
    </PageShell>
  );
}

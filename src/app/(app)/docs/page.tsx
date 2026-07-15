import Link from "next/link";
import { DocumentDrawer } from "@/components/docs/DocumentDrawer";
import { PageShell } from "@/components/shell/PageShell";
import { addDocumentAction } from "@/lib/actions";
import { requireAppContext } from "@/lib/app-context";
import { OWNER_ROLES, DOCSTAGES, docStageMeta } from "@/lib/domain";

const GXP_FRAMEWORKS = ["EU GMP Annex 11", "21 CFR Part 11", "GAMP 5", "ALCOA+", "GxP"];

interface DocsPageProps {
  searchParams: Promise<{ tab?: string; sel?: string }>;
}

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const sp = await searchParams;
  const { session, advisor, bucket } = await requireAppContext();

  const tab = sp.tab === "register" ? "register" : "kanban";
  const docs = bucket.documents.filter((d) => session.gxp || !d.gxp);
  const selNum = sp.sel ? Number(sp.sel) : undefined;
  const selected = selNum != null ? bucket.documents.find((d) => d.num === selNum) : undefined;

  const tabHref = (t: string) => `/docs?tab=${t}`;
  const tabClass = (on: boolean) => `text-[12.5px] px-3.5 py-1.5 rounded-lg ${on ? "bg-ck-ink text-white font-medium" : "bg-white border border-ck-border text-ck-text-2"}`;

  return (
    <PageShell
      title="Dokumentplan"
      subtitle="Appendix B · 12 styrede dokumenter · livscyklus"
      gxpOn={session.gxp}
      advisor={advisor}
    >
      <div className="p-7 pb-12 max-w-[1180px]">
        <div className="flex items-center gap-2 mb-4.5">
          <Link href={tabHref("register")} className={tabClass(tab === "register")}>
            Document register
          </Link>
          <Link href={tabHref("kanban")} className={tabClass(tab === "kanban")}>
            Lifecycle
          </Link>
          <div className="ml-auto text-[11.5px] text-ck-muted">{docs.length} controlled documents · Appendix B</div>
        </div>

        {tab === "kanban" ? (
          <>
            <div className="grid grid-cols-5 gap-3">
              {DOCSTAGES.map((stage) => {
                const m = docStageMeta(stage);
                const cards = docs.filter((d) => d.docStage === stage);
                return (
                  <div key={stage} className="bg-[#f1f2f4] rounded-xl px-2.5 py-2.75 min-h-[120px]">
                    <div className="flex items-center gap-1.75 text-[11.5px] font-semibold mb-2.5 px-0.75" style={{ color: m.fg }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: m.dot }} />
                      {m.da}
                      <span className="ml-auto text-ck-muted font-medium">{cards.length}</span>
                    </div>
                    <div className="flex flex-col gap-2.25">
                      {cards.map((d) => (
                        <Link
                          key={d.num}
                          href={`/docs?tab=kanban&sel=${d.num}`}
                          className="block bg-white border border-ck-border rounded-lg px-3 py-2.75 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-[10px] text-ck-muted">#{d.num}</span>
                            {d.gxp && (
                              <span className="text-[8.5px] font-semibold tracking-wide text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1 py-0.5 rounded">
                                GxP
                              </span>
                            )}
                            <span className="ml-auto text-[9.5px] text-ck-muted">{d.type}</span>
                          </div>
                          <div className="text-xs font-medium text-ck-ink leading-snug mb-2">{d.title}</div>
                          <div className="flex flex-wrap gap-1">
                            {d.frameworks.slice(0, 4).map((f) => (
                              <span
                                key={f}
                                className={`text-[9.5px] px-1.5 py-0.5 rounded border ${
                                  GXP_FRAMEWORKS.includes(f)
                                    ? "text-ck-violet-2 bg-ck-violet-bg border-ck-violet-border"
                                    : "text-ck-text-2 bg-[#f2f4f7] border-ck-border"
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3.5 text-[11px] text-ck-muted bg-white border border-dashed border-[#e4e7ec] rounded-lg px-3.5 py-2.75">
              Fundament (dokumentstyring): document-control standard · authoring &amp; approval workflow · controlled
              document register — sættes op i Fase 1 før procedurerne udrulles.
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="grid grid-cols-[40px_1fr_96px_118px_108px_70px_96px_130px] gap-2 px-4 py-2.75 text-[10px] tracking-wide uppercase text-ck-muted bg-[#fafafa] border-b border-ck-border">
                <div>Ref</div>
                <div>Document</div>
                <div>Type</div>
                <div>Owner</div>
                <div>Approver</div>
                <div>Ver.</div>
                <div>Effective</div>
                <div>Status</div>
              </div>
              {docs.map((d) => {
                const m = docStageMeta(d.docStage);
                return (
                  <Link
                    key={d.num}
                    href={`/docs?tab=register&sel=${d.num}`}
                    className="grid grid-cols-[40px_1fr_96px_118px_108px_70px_96px_130px] gap-2 items-center px-4 py-3 border-t border-[#f2f4f7] text-xs"
                  >
                    <div className="font-mono text-[11px] text-ck-muted">{d.num}</div>
                    <div className="text-ck-ink font-medium flex items-center gap-1.5">
                      {d.title}
                      {d.gxp && (
                        <span className="text-[8.5px] font-semibold text-ck-violet-2 bg-ck-violet-bg border border-ck-violet-border px-1 py-0.5 rounded">
                          GxP
                        </span>
                      )}
                    </div>
                    <div className="text-ck-muted-2 text-[11px]">{d.type}</div>
                    <div className="text-ck-muted-2 text-[11px] truncate">{d.owner}</div>
                    <div className="text-ck-muted-2 text-[11px] truncate">{d.approver}</div>
                    <div className="text-ck-muted-2 text-[11px]">{d.docStage === "Published" ? "1.0" : d.version}</div>
                    <div className="text-ck-muted-2 text-[11px]">{d.effective || "—"}</div>
                    <div>
                      <span className="inline-flex items-center gap-1.25 text-[11px]" style={{ color: m.fg }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
                        {m.da}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <form action={addDocumentAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.75 mt-3.5 text-[12.5px] font-medium text-ck-indigo bg-ck-indigo-bg border border-ck-indigo-border rounded-lg px-3.5 py-2.25"
              >
                <span className="text-base leading-none -mt-0.5">+</span>Add document
              </button>
            </form>
            <div className="text-[10.5px] text-ck-muted max-w-[820px] mt-3">
              Registeret opdateres automatisk fra godkendte/publicerede dokumenter. Version, effektiv dato og placering
              udfyldes efterhånden som hvert dokument udstedes (politik §28).
            </div>
          </>
        )}

        <div className="text-[10.5px] text-ck-muted max-w-[820px] mt-3.5">
          ComplyKit understøtter alignment med de nævnte standarder. Organisationen bør ikke fremstå som certificeret,
          medmindre certificering er selvstændigt og eksplicit opnået.
        </div>
      </div>

      {selected && <DocumentDrawer doc={selected} ownerOptions={OWNER_ROLES} />}
    </PageShell>
  );
}

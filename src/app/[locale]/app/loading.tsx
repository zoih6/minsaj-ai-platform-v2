import { PageShell } from "@/components/mj/page-kit";
import { SkeletonList } from "@/components/mj/primitives";

/**
 * App-scope route skeleton (MDS v4) — mirrors the page anatomy
 * (header block + list rows) so navigation keeps its geometry.
 * Language-neutral: no copy to read while loading.
 */
export default function AppLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="mj-sr">جارٍ التحميل · Loading</span>
      <PageShell>
        <div style={{ display: "grid", gap: 10, paddingBlockEnd: 22 }} aria-hidden="true">
          <div className="mj-skel" style={{ inlineSize: "46%", blockSize: 26, borderRadius: 6 }} />
          <div className="mj-skel" style={{ inlineSize: "72%", blockSize: 13 }} />
        </div>
        <SkeletonList rows={7} />
      </PageShell>
    </div>
  );
}

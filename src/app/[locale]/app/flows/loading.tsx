import { SkeletonList } from "@/components/mj/primitives";
import { PageShell } from "@/components/mj/page-kit";

/** Shell-matched loading state — header skeleton + list shimmer (MDS v4). */
export default function Loading() {
  return (
    <PageShell>
      <div style={{ display: "grid", gap: 8, paddingBlockEnd: 20 }} aria-hidden>
        <div className="mj-skel" style={{ inlineSize: 176, blockSize: 28 }} />
        <div className="mj-skel" style={{ inlineSize: "min(420px, 82%)", blockSize: 14 }} />
      </div>
      <SkeletonList rows={6} />
    </PageShell>
  );
}

/**
 * Locale-scope route skeleton (MDS v4) — a single quiet mark while the
 * segment resolves. Tiny by design: no branded choreography while loading.
 */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" style={{ display: "grid", placeItems: "center", minBlockSize: "60dvh", padding: 24 }}>
      <span className="mj-sr">جارٍ التحميل · Loading</span>
      <div
        aria-hidden="true"
        className="mj-skel"
        style={{ inlineSize: 88, blockSize: 88, borderRadius: "var(--r-lg)" }}
      />
    </div>
  );
}

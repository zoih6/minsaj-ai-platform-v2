"use client";

/* ============================================================
   MDS v4 — Knowledge («المعرفة») — collections index
   Anatomy: PageHeader + selvage → stat band → toolbar
   (search + status filter) → collections grid. Full state
   coverage: populated / empty (filter) / error (retry).
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, FileStack, FolderCheck, Layers, SearchX } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { KnowledgeCollection, KnowledgeSource } from "@minsaj/contracts";
import { Badge, EmptyState, ErrorState, SearchInput, Segmented, SkeletonList } from "./primitives";
import { PageHeader, PageShell, StatTile, TimeAgo, Toolbar } from "./page-kit";

type CollectionStatus = KnowledgeCollection["status"];

export function MjKnowledge({
  locale, dictionary, collections, sources, error,
}: {
  locale: Locale; dictionary: Dictionary;
  collections: KnowledgeCollection[]; sources: KnowledgeSource[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = knowledgeLabels(isAr);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CollectionStatus>("all");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (!q) return true;
      return c.name.ar.toLowerCase().includes(q) || c.name.en.toLowerCase().includes(q);
    });
  }, [collections, query, status]);

  if (error) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.knowledge} description={t.desc} />
        {retrying ? <SkeletonList rows={6} /> : (
          <ErrorState
            title={t.errTitle}
            body={t.errBody}
            retryLabel={t.retry}
            onRetry={() => { setRetrying(true); router.refresh(); }}
          />
        )}
      </PageShell>
    );
  }

  const readyCount = collections.filter((c) => c.status === "ready").length;
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  return (
    <PageShell>
      <PageHeader title={dictionary.nav.knowledge} description={t.desc} />

      {/* one calm stat band — real counts from the snapshot */}
      <div className="mj-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
        <StatTile label={t.statCollections} value={String(collections.length)} icon={<Layers size={14} />} />
        <StatTile label={t.statSources} value={String(sources.length)} icon={<FileStack size={14} />} />
        <StatTile label={t.statReady} value={String(readyCount)} icon={<FolderCheck size={14} />} />
      </div>

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
        <Segmented
          ariaLabel={t.filterA11y}
          value={status}
          onChange={(v) => setStatus(v as "all" | CollectionStatus)}
          options={[
            { id: "all", label: t.filterAll },
            { id: "ready", label: t.statusLabels.ready },
            { id: "indexing", label: t.statusLabels.indexing },
            { id: "stale", label: t.statusLabels.stale },
          ]}
        />
      </Toolbar>

      {collections.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={20} />}
          title={t.emptyTitle}
          body={t.emptyBody}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={t.noMatchTitle}
          body={t.noMatchBody}
          action={
            <button type="button" className="mj-btn mj-btn--secondary mj-btn--sm" onClick={() => { setQuery(""); setStatus("all"); }}>
              {t.clearFilters}
            </button>
          }
        />
      ) : (
        <div className="mj-grid mj-grid--cards">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/app/knowledge/${c.id}`}
              className="mj-card mj-card--link"
              style={{ padding: 20, display: "grid", gap: 10, alignContent: "start" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong className="mj-title-m mj-clamp-2" style={{ flex: "1 1 auto", minWidth: "120px" }}>{c.name[locale]}</strong>
                <StatusBadge status={c.status} labels={t.statusLabels} />
              </div>
              <p className="mj-body-s mj-ink-2 mj-clamp-2">{c.description[locale]}</p>
              <p className="mj-caption" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <FileStack size={12} />
                  <span className="mj-mono" dir="ltr">{c.sourceCount}</span> {t.sourcesUnit}
                </span>
                <span>{t.visibility[c.visibility]}</span>
                <TimeAgo iso={c.updatedAt} locale={locale} labels={t.ago} />
              </p>
              <span className="mj-caption" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ink-3)" }}>
                {t.openCollection} <Chevron size={13} />
              </span>
            </Link>
          ))}
        </div>
      )}

      <p className="mj-caption">{t.hint}</p>
    </PageShell>
  );
}

function StatusBadge({ status, labels }: { status: CollectionStatus; labels: Record<CollectionStatus, string> }) {
  const tone = status === "ready" ? "success" : status === "indexing" ? "warning" : status === "failed" ? "danger" : "neutral";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

function knowledgeLabels(isAr: boolean) {
  return isAr ? {
    desc: "مجموعات المعرفة التي يستند إليها الوكلاء والتدفقات — مصادر مفهرسة وجاهزة للاستشهاد.",
    statCollections: "المجموعات", statSources: "المصادر", statReady: "جاهزة",
    search: "ابحث في المجموعات…", searchA11y: "البحث في مجموعات المعرفة",
    filterA11y: "تصفية المجموعات حسب الحالة", filterAll: "الكل",
    statusLabels: { ready: "جاهزة", indexing: "تُفهرس الآن", stale: "تحتاج تحديثًا", failed: "فشلت" },
    visibility: { workspace: "على مستوى مساحة العمل", project: "ضمن مشروع" },
    sourcesUnit: "مصادر",
    openCollection: "عرض المصادر",
    emptyTitle: "لا توجد مجموعات معرفة بعد",
    emptyBody: "عندما تجمع مصادر لوكلائك ستظهر مجموعاتهم هنا مع حالة الفهرسة.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو أزل تصفية الحالة.",
    clearFilters: "إزالة التصفية",
    hint: "كل مجموعة تعرض عدد مصادرها وتاريخ آخر تحديث — الحالة من نظام الفهرسة.",
    errTitle: "تعذر تحميل مجموعات المعرفة",
    errBody: "حدث خطأ مؤقت أثناء جلب المجموعات. لم يفقد أي مصدر مكانه — أعد المحاولة.",
    retry: "إعادة المحاولة",
    ago: { now: "الآن", min: "دقيقة", hour: "ساعة", day: "يوم" },
  } : {
    desc: "The knowledge collections your agents and flows draw on — indexed sources, ready to cite.",
    statCollections: "Collections", statSources: "Sources", statReady: "Ready",
    search: "Search collections…", searchA11y: "Search knowledge collections",
    filterA11y: "Filter collections by status", filterAll: "All",
    statusLabels: { ready: "Ready", indexing: "Indexing", stale: "Needs refresh", failed: "Failed" },
    visibility: { workspace: "Workspace-wide", project: "Project-scoped" },
    sourcesUnit: "sources",
    openCollection: "View sources",
    emptyTitle: "No knowledge collections yet",
    emptyBody: "When your agents gather sources, their collections will appear here with indexing status.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another term or clear the status filter.",
    clearFilters: "Clear filters",
    hint: "Each collection shows its source count and last update — status comes from the indexing system.",
    errTitle: "Couldn’t load knowledge collections",
    errBody: "A temporary error occurred while fetching collections. No source lost its place — try again.",
    retry: "Try again",
    ago: { now: "now", min: "min ago", hour: "h ago", day: "d ago" },
  };
}

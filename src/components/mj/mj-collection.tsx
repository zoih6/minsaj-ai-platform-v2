"use client";

/* ============================================================
   MDS v4 — Collection detail («مجموعة معرفة»)
   Back affordance → collection header → stat band → its
   sources (filtered server-side by collectionId) with kind,
   status, and sensitivity. Empty + error states covered.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Database, FileText, Link as LinkIcon, SearchX, Type, Users,
} from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { KnowledgeCollection, KnowledgeSource } from "@minsaj/contracts";
import { Badge, EmptyState, ErrorState, SearchInput, SkeletonList } from "./primitives";
import { ListRow, PageHeader, PageShell, StatTile, TimeAgo, Toolbar } from "./page-kit";

type SourceStatus = KnowledgeSource["status"];
type SourceKind = KnowledgeSource["kind"];

export function MjCollectionDetail({
  locale, dictionary, collection, sources, error,
}: {
  locale: Locale; dictionary: Dictionary;
  collection: KnowledgeCollection | null; sources: KnowledgeSource[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = collectionLabels(isAr);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [retrying, setRetrying] = useState(false);
  const Back = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((s) => s.name.ar.toLowerCase().includes(q) || s.name.en.toLowerCase().includes(q));
  }, [sources, query]);

  if (error || !collection) {
    return (
      <PageShell>
        <PageHeader
          title={collection ? collection.name[locale] : dictionary.nav.knowledge}
          description={collection ? collection.description[locale] : undefined}
        />
        {retrying ? <SkeletonList rows={5} /> : (
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

  return (
    <PageShell>
      <PageHeader
        title={collection.name[locale]}
        description={collection.description[locale]}
        actions={
          <Link href={`/${locale}/app/knowledge`} className="mj-btn mj-btn--ghost mj-btn--sm">
            <Back size={14} />{t.backToCollections}
          </Link>
        }
      />

      <div className="mj-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
        <StatTile label={t.statSources} value={String(sources.length)} icon={<FileText size={14} />} />
        <StatTile label={t.statChunks} value={String(collection.chunkCount)} icon={<Database size={14} />} />
        <StatTile label={t.statAgents} value={String(collection.usedByAgents)} icon={<Users size={14} />} />
      </div>

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
        <Badge tone="outline">{t.statusLabels[collection.status]}</Badge>
        <Badge tone="outline">{t.visibility[collection.visibility]}</Badge>
      </Toolbar>

      {sources.length === 0 ? (
        <EmptyState
          icon={<FileText size={20} />}
          title={t.emptyTitle}
          body={t.emptyBody}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={t.noMatchTitle}
          body={t.noMatchBody}
          action={
            <button type="button" className="mj-btn mj-btn--secondary mj-btn--sm" onClick={() => setQuery("")}>
              {t.clearSearch}
            </button>
          }
        />
      ) : (
        <div className="mj-list">
          {filtered.map((s) => {
            const KindIcon = s.kind === "file" ? FileText : s.kind === "url" ? LinkIcon : Type;
            return (
              <ListRow
                key={s.id}
                leading={<span className="mj-avatar"><KindIcon size={16} /></span>}
                title={s.name[locale]}
                desc={
                  <span className="mj-mono" dir="ltr" style={{ color: "var(--ink-3)" }}>{s.origin}</span>
                }
                trailing={
                  <>
                    <SourceStatusBadge status={s.status} labels={t.sourceStatus} />
                    <span className="mj-caption mj-mono" dir="ltr">{s.chunkCount}</span>
                    {s.sensitivity === "restricted" ? <Badge tone="warning">{t.restricted}</Badge> : null}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <p className="mj-caption" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <TimeAgo iso={collection.updatedAt} locale={locale} labels={t.ago} />
        <span>·</span>
        <span>{t.kindHint.file} / {t.kindHint.url} / {t.kindHint.text}</span>
      </p>
    </PageShell>
  );
}

function SourceStatusBadge({ status, labels }: { status: SourceStatus; labels: Record<SourceStatus, string> }) {
  const tone =
    status === "ready" ? "success" :
    status === "stale" ? "neutral" :
    status === "failed" ? "danger" : "warning";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

function collectionLabels(isAr: boolean) {
  return isAr ? {
    backToCollections: "كل المجموعات",
    statSources: "المصادر في هذه المجموعة", statChunks: "المقاطع المفهرسة", statAgents: "وكلاء يستخدمونها",
    search: "ابحث في مصادر المجموعة…", searchA11y: "البحث في مصادر هذه المجموعة",
    statusLabels: { ready: "جاهزة", indexing: "تُفهرس الآن", stale: "تحتاج تحديثًا", failed: "فشلت" },
    visibility: { workspace: "على مستوى مساحة العمل", project: "ضمن مشروع" },
    sourceStatus: { validating: "تحقق", scanning: "فحص", extracting: "استخراج", indexing: "فهرسة", ready: "جاهز", stale: "قديم", failed: "فشل" },
    restricted: "وصول مقيد",
    emptyTitle: "لا مصادر في هذه المجموعة بعد",
    emptyBody: "أضف ملفات أو روابط وستظهر هنا مع حالة الفهرسة أولًا بأول.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو أفرغ حقل البحث.",
    clearSearch: "إفراغ البحث",
    kindHint: { file: "ملفات", url: "روابط", text: "نصوص" },
    ago: { now: "آخر تحديث الآن", min: "دقيقة منذ التحديث", hour: "ساعة منذ التحديث", day: "يوم منذ التحديث" },
    errTitle: "تعذر تحميل تفاصيل المجموعة",
    errBody: "حدث خطأ مؤقت أثناء جلب مصادر المجموعة — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    backToCollections: "All collections",
    statSources: "Sources in this collection", statChunks: "Indexed chunks", statAgents: "Agents using it",
    search: "Search sources in this collection…", searchA11y: "Search sources in this collection",
    statusLabels: { ready: "Ready", indexing: "Indexing", stale: "Needs refresh", failed: "Failed" },
    visibility: { workspace: "Workspace-wide", project: "Project-scoped" },
    sourceStatus: { validating: "Validating", scanning: "Scanning", extracting: "Extracting", indexing: "Indexing", ready: "Ready", stale: "Stale", failed: "Failed" },
    restricted: "Restricted",
    emptyTitle: "No sources in this collection yet",
    emptyBody: "Add files or links and they will appear here with live indexing status.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another term or clear the search field.",
    clearSearch: "Clear search",
    kindHint: { file: "Files", url: "URLs", text: "Text" },
    ago: { now: "Updated now", min: "min since update", hour: "h since update", day: "d since update" },
    errTitle: "Couldn’t load the collection",
    errBody: "A temporary error occurred while fetching this collection’s sources — try again.",
    retry: "Try again",
  };
}

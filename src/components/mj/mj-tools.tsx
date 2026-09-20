"use client";

/* ============================================================
   MDS v4 — Tools catalog («الأدوات»)
   Rows: name, description, risk (RiskBadge), connection
   status, usage count. Category filter + search. Honest
   states throughout — no wiring knobs for what isn’t wired.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { SearchX, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { ToolCatalogItem } from "@minsaj/contracts";
import { Badge, EmptyState, ErrorState, SearchInput, Segmented, SkeletonList } from "./primitives";
import { ListRow, PageHeader, PageShell, Toolbar } from "./page-kit";
import { RiskBadge } from "./data";

type ToolStatus = ToolCatalogItem["status"];
type ToolCategory = ToolCatalogItem["category"];

export function MjTools({
  locale, dictionary, tools, error,
}: {
  locale: Locale; dictionary: Dictionary; tools: ToolCatalogItem[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = toolLabels(isAr);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ToolCategory>("all");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (category !== "all" && tool.category !== category) return false;
      if (!q) return true;
      return tool.name.ar.toLowerCase().includes(q) || tool.name.en.toLowerCase().includes(q);
    });
  }, [tools, query, category]);

  if (error) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.tools} description={t.desc} />
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
      <PageHeader title={dictionary.nav.tools} description={t.desc} />

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
        <Segmented
          ariaLabel={t.filterA11y}
          value={category}
          onChange={(v) => setCategory(v as "all" | ToolCategory)}
          options={[
            { id: "all", label: t.filterAll },
            { id: "search", label: t.categories.search },
            { id: "files", label: t.categories.files },
            { id: "communication", label: t.categories.communication },
            { id: "data", label: t.categories.data },
          ]}
        />
      </Toolbar>

      {tools.length === 0 ? (
        <EmptyState icon={<Wrench size={20} />} title={t.emptyTitle} body={t.emptyBody} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={t.noMatchTitle}
          body={t.noMatchBody}
          action={
            <button type="button" className="mj-btn mj-btn--secondary mj-btn--sm" onClick={() => { setQuery(""); setCategory("all"); }}>
              {t.clearFilters}
            </button>
          }
        />
      ) : (
        <div className="mj-list">
          {filtered.map((tool) => (
            <ListRow
              key={tool.id}
              leading={<span className="mj-avatar"><Wrench size={16} /></span>}
              title={tool.name[locale]}
              desc={<span className="mj-clamp-2">{tool.description[locale]}</span>}
              trailing={
                <>
                  <RiskBadge risk={tool.risk} labels={t.risk} />
                  <StatusBadge status={tool.status} labels={t.statusLabels} />
                </>
              }
            />
          ))}
        </div>
      )}

      <p className="mj-caption">{t.hint}</p>
    </PageShell>
  );
}

function StatusBadge({ status, labels }: { status: ToolStatus; labels: Record<ToolStatus, string> }) {
  const tone = status === "connected" ? "success" : status === "review_required" ? "warning" : "neutral";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

function toolLabels(isAr: boolean) {
  return isAr ? {
    desc: "الأدوات التي يمكن للوكلاء استدعاؤها — كل أداة معلَّمة بمستوى الخطورة وحالة الربط.",
    search: "ابحث في الأدوات…", searchA11y: "البحث في الأدوات",
    filterA11y: "تصفية الأدوات حسب التصنيف", filterAll: "الكل",
    categories: { search: "بحث", files: "ملفات", communication: "تواصل", data: "بيانات" },
    risk: { read: "قراءة فقط", write_internal: "تعديل داخلي", external_side_effect: "أثر خارجي", destructive: "إجراء حذّاق" },
    statusLabels: { available: "متاحة", connected: "مربوطة", review_required: "تتطلب مراجعة" },
    emptyTitle: "لا أدوات في الفهرس بعد",
    emptyBody: "عند ربط أدوات مساحة العمل ستظهر هنا مع مستوى الخطورة وحالة كل أداة.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو أزل تصنيف التصنيف.",
    clearFilters: "إزالة التصفية",
    hint: "الأدوات ذات الأثر الخارجي لا تُنفَّذ إلا خلف بوابة موافقة بشرية.",
    errTitle: "تعذر تحميل فهرس الأدوات",
    errBody: "حدث خطأ مؤقت أثناء جلب الأدوات — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    desc: "The tools your agents can call — each labeled with its risk level and connection status.",
    search: "Search tools…", searchA11y: "Search tools",
    filterA11y: "Filter tools by category", filterAll: "All",
    categories: { search: "Search", files: "Files", communication: "Communication", data: "Data" },
    risk: { read: "Read-only", write_internal: "Internal write", external_side_effect: "External effect", destructive: "Destructive" },
    statusLabels: { available: "Available", connected: "Connected", review_required: "Review required" },
    emptyTitle: "No tools in the catalog yet",
    emptyBody: "When workspace tools are connected they will appear here with risk level and status.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another term or clear the category filter.",
    clearFilters: "Clear filters",
    hint: "Tools with external effects only run behind a human approval gate.",
    errTitle: "Couldn’t load the tool catalog",
    errBody: "A temporary error occurred while fetching tools — try again.",
    retry: "Try again",
  };
}

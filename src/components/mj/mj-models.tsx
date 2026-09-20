"use client";

/* ============================================================
   MDS v4 — Model catalog («النماذج»)
   Rows: provider monogram, Latin name in bdi, status badge,
   speed/cost voice labels, payer. Links to model detail.
   Toolbar: search + status filter. Full state coverage.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, ChevronLeft, ChevronRight, Route, SearchX } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { CatalogModel } from "@minsaj/contracts";
import { Badge, EmptyState, ErrorState, SearchInput, Segmented, SkeletonList } from "./primitives";
import { ListRow, PageHeader, PageShell, Toolbar } from "./page-kit";
import { ProviderMark } from "./data";

type ModelStatus = CatalogModel["status"];

export function MjModels({
  locale, dictionary, models, error,
}: {
  locale: Locale; dictionary: Dictionary; models: CatalogModel[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = modelLabels(isAr);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ModelStatus>("all");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
    });
  }, [models, query, status]);

  if (error) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.models} description={t.desc} />
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

  const Chevron = isAr ? ChevronLeft : ChevronRight;

  return (
    <PageShell>
      <PageHeader
        title={dictionary.nav.models}
        description={t.desc}
        actions={
          <Link href={`/${locale}/app/models/routing`} className="mj-btn mj-btn--secondary mj-btn--sm">
            <Route size={14} />{t.routing}
          </Link>
        }
      />

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
        <Segmented
          ariaLabel={t.filterA11y}
          value={status}
          onChange={(v) => setStatus(v as "all" | ModelStatus)}
          options={[
            { id: "all", label: t.filterAll },
            { id: "available", label: t.statusLabels.available },
            { id: "degraded", label: t.statusLabels.degraded },
            { id: "unavailable", label: t.statusLabels.unavailable },
          ]}
        />
      </Toolbar>

      {models.length === 0 ? (
        <EmptyState icon={<Boxes size={20} />} title={t.emptyTitle} body={t.emptyBody} />
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
        <div className="mj-list">
          {filtered.map((m) => (
            <ListRow
              key={m.id}
              href={`/${locale}/app/models/${m.id}`}
              leading={<ProviderMark name={m.provider} />}
              title={<bdi dir="ltr">{m.name}</bdi>}
              desc={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <bdi dir="ltr">{m.provider}</bdi>
                  <span aria-hidden>·</span>
                  <span>{t.speed[m.relativeSpeed]}</span>
                  <span aria-hidden>·</span>
                  <span>{t.cost[m.relativeCost]}</span>
                  <Badge tone="outline">{t.access[m.access]}</Badge>
                </span>
              }
              trailing={
                <>
                  <StatusBadge status={m.status} labels={t.statusLabels} />
                  <Chevron size={15} aria-hidden style={{ color: "var(--ink-3)" }} />
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

function StatusBadge({ status, labels }: { status: ModelStatus; labels: Record<ModelStatus, string> }) {
  const tone = status === "available" ? "success" : status === "degraded" ? "warning" : "danger";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

export function modelLabels(isAr: boolean) {
  return isAr ? {
    desc: "النماذج المتاحة لمساحة عملك — الحالة من المزودين، والسرعة والتكلفة بالقياس النسبي.",
    routing: "قواعد التوجيه",
    search: "ابحث بالاسم أو المزود…", searchA11y: "البحث في النماذج",
    filterA11y: "تصفية النماذج حسب الحالة", filterAll: "الكل",
    statusLabels: { available: "متاح", degraded: "أداء متذبذب", unavailable: "غير متاح" },
    speed: { fast: "سريع", balanced: "متوازن", slow: "عميق" },
    cost: { low: "تكلفة منخفضة", medium: "تكلفة متوسطة", high: "تكلفة مرتفعة" },
    payer: { platform_credits: "رصيد المنصة", byok: "مفاتيحك الخاصة", mixed: "مصدر مختلط" },
    access: { platform: "عبر رصيد المنصة", byok: "بمفاتيحك الخاصة", both: "الطريقتان معًا" },
    emptyTitle: "لا نماذج في الفهرس بعد",
    emptyBody: "عند ربط مزود أو إضافة مفتاحك الخاص ستظهر النماذج هنا.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب اسمًا آخر أو أزل تصفية الحالة.",
    clearFilters: "إزالة التصفية",
    hint: "الأسعار لكل مليون وحدة وتظهر في صفحة كل نموذج — القرار لك في كل محادثة.",
    errTitle: "تعذر تحميل فهرس النماذج",
    errBody: "حدث خطأ مؤقت أثناء جلب النماذج — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    desc: "The models available to your workspace — status from providers, speed and cost as relative reads.",
    routing: "Routing rules",
    search: "Search by name or provider…", searchA11y: "Search models",
    filterA11y: "Filter models by status", filterAll: "All",
    statusLabels: { available: "Available", degraded: "Degraded", unavailable: "Unavailable" },
    speed: { fast: "Fast", balanced: "Balanced", slow: "Deep" },
    cost: { low: "Low cost", medium: "Medium cost", high: "High cost" },
    payer: { platform_credits: "Platform credits", byok: "Your own keys", mixed: "Mixed payer" },
    access: { platform: "Via platform credits", byok: "With your own keys", both: "Both paths" },
    emptyTitle: "No models in the catalog yet",
    emptyBody: "Connect a provider or add your own key and models will appear here.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another name or clear the status filter.",
    clearFilters: "Clear filters",
    hint: "Prices are per million units and shown on each model’s page — the choice stays yours in every chat.",
    errTitle: "Couldn’t load the model catalog",
    errBody: "A temporary error occurred while fetching models — try again.",
    retry: "Try again",
  };
}

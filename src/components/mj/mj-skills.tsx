"use client";

/* ============================================================
   MDS v4 — Skills catalog («المهارات»)
   Cards per skillCatalogItemSchema: name, description,
   source/version/license (openly linked), trust badge,
   permissions in mono. Trust filter + search.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, SearchX, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { SkillCatalogItem } from "@minsaj/contracts";
import { Badge, EmptyState, ErrorState, SearchInput, Segmented, SkeletonList } from "./primitives";
import { PageHeader, PageShell, Toolbar } from "./page-kit";

type Trust = SkillCatalogItem["trust"];

export function MjSkills({
  locale, dictionary, skills, error,
}: {
  locale: Locale; dictionary: Dictionary; skills: SkillCatalogItem[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = skillLabels(isAr);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trust, setTrust] = useState<"all" | Trust>("all");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (trust !== "all" && s.trust !== trust) return false;
      if (!q) return true;
      return s.name.ar.toLowerCase().includes(q) || s.name.en.toLowerCase().includes(q);
    });
  }, [skills, query, trust]);

  if (error) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.skills} description={t.desc} />
        {retrying ? <SkeletonList rows={4} /> : (
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
      <PageHeader title={dictionary.nav.skills} description={t.desc} />

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
        <Segmented
          ariaLabel={t.filterA11y}
          value={trust}
          onChange={(v) => setTrust(v as "all" | Trust)}
          options={[
            { id: "all", label: t.filterAll },
            { id: "reviewed", label: t.trustLabels.reviewed },
            { id: "review_needed", label: t.trustLabels.review_needed },
          ]}
        />
      </Toolbar>

      {skills.length === 0 ? (
        <EmptyState icon={<Sparkles size={20} />} title={t.emptyTitle} body={t.emptyBody} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={t.noMatchTitle}
          body={t.noMatchBody}
          action={
            <button type="button" className="mj-btn mj-btn--secondary mj-btn--sm" onClick={() => { setQuery(""); setTrust("all"); }}>
              {t.clearFilters}
            </button>
          }
        />
      ) : (
        <div className="mj-grid mj-grid--cards">
          {filtered.map((s) => (
            <article key={s.id} className="mj-card" style={{ padding: 20, display: "grid", gap: 10, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong className="mj-title-m mj-clamp-2" style={{ flex: "1 1 auto", minWidth: "120px" }}>{s.name[locale]}</strong>
                <TrustBadge trust={s.trust} labels={t.trustLabels} />
              </div>
              <p className="mj-body-s mj-ink-2 mj-clamp-2">{s.description[locale]}</p>
              <div className="mj-well" style={{ display: "grid", gap: 6 }}>
                <span className="mj-caption" style={{ display: "inline-flex", gap: 12, flexWrap: "wrap" }}>
                  <span className="mj-mono" dir="ltr">v{s.version}</span>
                  <span>·</span>
                  <span className="mj-mono" dir="ltr">{s.license}</span>
                </span>
                <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="mj-body-s" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent-text)", minBlockSize: 24 }}>
                  <bdi dir="ltr" className="mj-truncate">{s.sourceUrl.replace(/^https?:\/\//, "")}</bdi>
                  <ExternalLink size={12} aria-hidden />
                </a>
              </div>
              <p className="mj-caption" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {s.permissions.map((p) => (
                  <span key={p} className="mj-mono" dir="ltr" style={{ padding: "2px 6px", background: "var(--well)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>{p}</span>
                ))}
              </p>
              <p className="mj-caption">
                <span className="mj-mono" dir="ltr">{s.usedBy}</span> {t.usedByUnit}
              </p>
            </article>
          ))}
        </div>
      )}

      <p className="mj-caption">{t.hint}</p>
    </PageShell>
  );
}

function TrustBadge({ trust, labels }: { trust: Trust; labels: Record<Trust, string> }) {
  const tone = trust === "reviewed" ? "success" : trust === "review_needed" ? "warning" : "danger";
  return <Badge tone={tone}>{labels[trust]}</Badge>;
}

function skillLabels(isAr: boolean) {
  return isAr ? {
    desc: "مهارات مفتوحة المصدر يمكن للوكلاء حملها — مصدرها وترخيصها وأذوناتها معلنة قبل الاستخدام.",
    search: "ابحث في المهارات…", searchA11y: "البحث في المهارات",
    filterA11y: "تصفية المهارات حسب حالة المراجعة", filterAll: "الكل",
    trustLabels: { reviewed: "مراجَعة", review_needed: "تحتاج مراجعة", blocked: "محجوبة" },
    usedByUnit: "وكلاء يستخدمونها",
    emptyTitle: "لا مهارات مثبتة بعد",
    emptyBody: "عند تثبيت مهارة من مصدرها المفتوح ستظهر هنا مع أذوناتها قبل أي استخدام.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو أزل تصفية المراجعة.",
    clearFilters: "إزالة التصفية",
    hint: "المهارات غير المراجَعة تظهر بأذوناتها كاملة — والقرار في تفعيلها يبقى لك.",
    errTitle: "تعذر تحميل فهرس المهارات",
    errBody: "حدث خطأ مؤقت أثناء جلب المهارات — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    desc: "Open-source skills your agents can adopt — source, license, and permissions declared before use.",
    search: "Search skills…", searchA11y: "Search skills",
    filterA11y: "Filter skills by review status", filterAll: "All",
    trustLabels: { reviewed: "Reviewed", review_needed: "Needs review", blocked: "Blocked" },
    usedByUnit: "agents using it",
    emptyTitle: "No skills installed yet",
    emptyBody: "When a skill is installed from its open source it will appear here with its permissions before any use.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another term or clear the review filter.",
    clearFilters: "Clear filters",
    hint: "Unreviewed skills appear with their full permissions — enabling them stays your decision.",
    errTitle: "Couldn’t load the skill catalog",
    errBody: "A temporary error occurred while fetching skills — try again.",
    retry: "Try again",
  };
}

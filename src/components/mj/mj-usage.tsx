"use client";

/* ============================================================
   MDS v4 — Usage («الاستخدام»)
   Stat band (spend on platform credits, events, units) →
   toolbar (search + payer filter) → events as rows on small
   screens and a table from md up. Cost via MoneyView; BYOK
   rows say so instead of showing a misleading $0.00.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChartNoAxesColumn, Receipt, SearchX, Zap } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { UsageEvent } from "@minsaj/contracts";
import { Badge, EmptyState, ErrorState, SearchInput, Segmented, SkeletonList } from "./primitives";
import { ListRow, MoneyView, PageHeader, PageShell, StatTile, Toolbar } from "./page-kit";
import { PayerBadge } from "./data";

type EventStatus = UsageEvent["status"];
type Payer = UsageEvent["payer"];

export function MjUsage({
  locale, dictionary, events, error,
}: {
  locale: Locale; dictionary: Dictionary; events: UsageEvent[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = usageLabels(isAr);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [payer, setPayer] = useState<"all" | Payer>("all");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (payer !== "all" && e.payer !== payer) return false;
      if (!q) return true;
      return (
        e.title.ar.toLowerCase().includes(q) || e.title.en.toLowerCase().includes(q) ||
        e.projectName.ar.toLowerCase().includes(q) || e.projectName.en.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q)
      );
    });
  }, [events, query, payer]);

  if (error) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.usage} description={t.desc} />
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

  /* real aggregations — nothing invented */
  const platformSpend = events
    .filter((e) => e.payer === "platform_credits")
    .reduce((sum, e) => sum + e.actual.amountMinor, 0);
  const totalUnits = events.reduce((sum, e) => sum + e.inputUnits + e.outputUnits, 0);
  const currency = events[0]?.actual.currency ?? "USD";

  return (
    <PageShell>
      <PageHeader title={dictionary.nav.usage} description={t.desc} />

      <div className="mj-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
        <div className="mj-card mj-stat">
          <span className="mj-stat__label"><Receipt size={14} />{t.statSpend}</span>
          <strong className="mj-stat__value"><MoneyView amountMinor={platformSpend} currency={currency} locale={locale} /></strong>
          <span className="mj-stat__meta">{t.statSpendHint}</span>
        </div>
        <StatTile label={t.statEvents} value={String(events.length)} icon={<ChartNoAxesColumn size={14} />} />
        <StatTile label={t.statUnits} value={totalUnits.toLocaleString("en-US")} icon={<Zap size={14} />} meta={t.statUnitsHint} />
      </div>

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
        <Segmented
          ariaLabel={t.filterA11y}
          value={payer}
          onChange={(v) => setPayer(v as "all" | Payer)}
          options={[
            { id: "all", label: t.filterAll },
            { id: "platform_credits", label: t.payerLabels.platform_credits },
            { id: "byok", label: t.payerLabels.byok },
          ]}
        />
      </Toolbar>

      {events.length === 0 ? (
        <EmptyState icon={<ChartNoAxesColumn size={20} />} title={t.emptyTitle} body={t.emptyBody} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={t.noMatchTitle}
          body={t.noMatchBody}
          action={
            <button type="button" className="mj-btn mj-btn--secondary mj-btn--sm" onClick={() => { setQuery(""); setPayer("all"); }}>
              {t.clearFilters}
            </button>
          }
        />
      ) : (
        <>
          {/* small screens: one-line rows */}
          <div className="mj-list md:hidden">
            {filtered.map((e) => (
              <ListRow
                key={e.id}
                href={`/${locale}/app/runs/${e.runId}`}
                leading={<span className="mj-avatar"><Receipt size={16} /></span>}
                title={e.title[locale]}
                desc={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <bdi dir="ltr">{e.model}</bdi>
                    <span aria-hidden>·</span>
                    <StatusBadge status={e.status} labels={t.statusLabels} />
                  </span>
                }
                trailing={e.payer === "platform_credits" ? (
                  <MoneyView amountMinor={e.actual.amountMinor} currency={e.actual.currency} locale={locale} />
                ) : (
                  <PayerBadge payer={e.payer} labels={t.payerLabels} />
                )}
              />
            ))}
          </div>

          {/* md and up: the table */}
          <div className="mj-table-wrap hidden md:block">
            <table className="mj-table">
              <thead>
                <tr>
                  <th scope="col">{t.colRun}</th>
                  <th scope="col">{t.colModel}</th>
                  <th scope="col">{t.colUnits}</th>
                  <th scope="col">{t.colCost}</th>
                  <th scope="col">{t.colStatus}</th>
                  <th scope="col">{t.colDate}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/${locale}/app/runs/${e.runId}`} className="mj-label mj-clamp-2" style={{ color: "var(--ink)" }}>{e.title[locale]}</Link>
                      <span className="mj-caption" style={{ display: "block" }}>{e.projectName[locale]}</span>
                    </td>
                    <td>
                      <bdi dir="ltr">{e.model}</bdi>
                      <span style={{ display: "block", marginTop: 4 }}>
                        <PayerBadge payer={e.payer} labels={t.payerLabels} />
                      </span>
                    </td>
                    <td>
                      <span className="mj-mono" dir="ltr">{e.inputUnits.toLocaleString("en-US")} → {e.outputUnits.toLocaleString("en-US")}</span>
                    </td>
                    <td>
                      {e.payer === "platform_credits" ? (
                        <MoneyView amountMinor={e.actual.amountMinor} currency={e.actual.currency} locale={locale} />
                      ) : (
                        <span className="mj-caption">{t.onYourKeys}</span>
                      )}
                    </td>
                    <td><StatusBadge status={e.status} labels={t.statusLabels} /></td>
                    <td><span className="mj-mono" dir="ltr">{fmtDate(e.occurredAt, isAr)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="mj-caption">{t.hint}</p>
    </PageShell>
  );
}

function StatusBadge({ status, labels }: { status: EventStatus; labels: Record<EventStatus, string> }) {
  const tone = status === "settled" ? "success" : status === "settling" ? "warning" : "neutral";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

function fmtDate(iso: string, isAr: boolean) {
  try {
    return new Date(iso).toLocaleDateString(
      isAr ? "ar-EG-u-nu-latn" : "en-US",
      { day: "numeric", month: "short", year: "numeric" },
    );
  } catch {
    return iso.slice(0, 10);
  }
}

function usageLabels(isAr: boolean) {
  return isAr ? {
    desc: "كل حدث استهلاك بنموذج — الوحدات والتكلفة الفعلية ومصدر الدفع، مرتبطًا بتشغيله.",
    statSpend: "المصروف من رصيد المنصة", statSpendHint: "مجموع المسوّى على رصيد المنصة خلال الفترة الظاهرة.",
    statEvents: "أحداث الاستخدام", statUnits: "الوحدات المتداولة", statUnitsHint: "إدخال وإخراج مجتمعين.",
    search: "ابحث بتشغيل أو مشروع أو نموذج…", searchA11y: "البحث في أحداث الاستخدام",
    filterA11y: "تصفية حسب مصدر الدفع", filterAll: "الكل",
    payerLabels: { platform_credits: "رصيد المنصة", byok: "مفاتيحك الخاصة", mixed: "مصدر مختلط" },
    statusLabels: { reserved: "محجوز", settling: "تسوية جارية", settled: "مسوّى", adjusted: "معدّل" },
    colRun: "التشغيل", colModel: "النموذج", colUnits: "الوحدات (إدخال ← إخراج)", colCost: "التكلفة الفعلية", colStatus: "الحالة", colDate: "التاريخ",
    onYourKeys: "خارج رصيد المنصة",
    emptyTitle: "لا أحداث استخدام بعد",
    emptyBody: "عند أول تشغيل بنموذج سيظهر حدثه هنا مع وحداته وتكلفته.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو أزل تصفية مصدر الدفع.",
    clearFilters: "إزالة التصفية",
    hint: "الأحداث على مفاتيحك الخاصة تظهر دون تكلفة منصة — فاتورتها عند مزودها.",
    errTitle: "تعذر تحميل أحداث الاستخدام",
    errBody: "حدث خطأ مؤقت أثناء جلب الأحداث — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    desc: "Every model consumption event — units, actual cost, and payer, linked to its run.",
    statSpend: "Spent from platform credits", statSpendHint: "Sum settled on platform credits over the visible period.",
    statEvents: "Usage events", statUnits: "Units moved", statUnitsHint: "Input and output combined.",
    search: "Search by run, project, or model…", searchA11y: "Search usage events",
    filterA11y: "Filter by payer", filterAll: "All",
    payerLabels: { platform_credits: "Platform credits", byok: "Your own keys", mixed: "Mixed payer" },
    statusLabels: { reserved: "Reserved", settling: "Settling", settled: "Settled", adjusted: "Adjusted" },
    colRun: "Run", colModel: "Model", colUnits: "Units (in → out)", colCost: "Actual cost", colStatus: "Status", colDate: "Date",
    onYourKeys: "Off platform credits",
    emptyTitle: "No usage events yet",
    emptyBody: "The first model run will record its event here with units and cost.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another term or clear the payer filter.",
    clearFilters: "Clear filters",
    hint: "Events on your own keys appear without platform cost — their invoice lives with the provider.",
    errTitle: "Couldn’t load usage events",
    errBody: "A temporary error occurred while fetching events — try again.",
    retry: "Try again",
  };
}

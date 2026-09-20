"use client";

/* ============================================================
   MDS v4 — Model detail («صفحة النموذج»)
   Header + try-in-chat CTA → pricing well → DefinitionList
   of the catalogModelSchema fields → capabilities badges.
   Unknown ids never reach here (server notFound).
   ============================================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { CatalogModel } from "@minsaj/contracts";
import { Badge, ErrorState, SkeletonList } from "./primitives";
import { PageHeader, PageShell, SectionHead } from "./page-kit";
import { DefinitionList, ModelChip, PayerBadge } from "./data";
import { modelLabels } from "./mj-models";

export function MjModelDetail({
  locale, dictionary, model, error,
}: {
  locale: Locale; dictionary: Dictionary; model: CatalogModel | null; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = detailLabels(isAr);
  const m = modelLabels(isAr);
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const Back = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  if (error || !model) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.models} />
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

  const ctx = `${Math.round(model.contextWindow / 1000)}K`;

  return (
    <PageShell>
      <PageHeader
        title={model.name}
        description={model.description[locale]}
        actions={
          <>
            <Link href={`/${locale}/app/models`} className="mj-btn mj-btn--ghost mj-btn--sm">
              <Back size={14} />{t.backToCatalog}
            </Link>
            <Link href={`/${locale}/app/chat?model=${model.id}`} className="mj-btn mj-btn--primary mj-btn--sm">
              <MessageCircle size={14} />{t.tryInChat}
            </Link>
          </>
        }
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <ModelChip name={model.name} provider={model.provider} />
        <StatusBadge status={model.status} labels={m.statusLabels} />
        <PayerBadge payer={model.access === "both" ? "mixed" : model.access === "platform" ? "platform_credits" : "byok"} labels={m.payer} />
      </div>

      {/* pricing — the honest numbers, mono, ltr */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.pricingTitle} />
        <div className="mj-card mj-card--pad" style={{ display: "grid", gap: 12 }}>
          <div className="mj-well" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }}>
            <div style={{ display: "grid", gap: 2 }}>
              <span className="mj-caption">{t.inputPrice}</span>
              <span className="mj-mono" dir="ltr" style={{ fontSize: 16, color: "var(--ink)" }}>${model.inputPricePerMillion.toFixed(2)}</span>
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              <span className="mj-caption">{t.outputPrice}</span>
              <span className="mj-mono" dir="ltr" style={{ fontSize: 16, color: "var(--ink)" }}>${model.outputPricePerMillion.toFixed(2)}</span>
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              <span className="mj-caption">{t.perUnit}</span>
              <span className="mj-caption" style={{ color: "var(--ink-2)" }}>{t.perUnitHint}</span>
            </div>
          </div>
          <DefinitionList
            items={[
              { term: t.provider, value: <bdi dir="ltr">{model.provider}</bdi> },
              { term: t.contextWindow, value: <span className="mj-mono" dir="ltr">{ctx}</span> },
              { term: t.speed, value: m.speed[model.relativeSpeed] },
              { term: t.cost, value: m.cost[model.relativeCost] },
              { term: t.accessTerm, value: m.access[model.access] },
            ]}
          />
        </div>
      </section>

      {/* capabilities */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.capabilitiesTitle} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {model.capabilities.map((c) => (
            <Badge key={c} tone="neutral">{t.capabilities[c]}</Badge>
          ))}
        </div>
        <p className="mj-caption">{t.capabilitiesHint}</p>
      </section>
    </PageShell>
  );
}

function StatusBadge({ status, labels }: { status: CatalogModel["status"]; labels: Record<CatalogModel["status"], string> }) {
  const tone = status === "available" ? "success" : status === "degraded" ? "warning" : "danger";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

function detailLabels(isAr: boolean) {
  return isAr ? {
    backToCatalog: "فهرس النماذج", tryInChat: "جرّبه في محادثة",
    pricingTitle: "التسعير", inputPrice: "لكل مليون وحدة إدخال", outputPrice: "لكل مليون وحدة إخراج",
    perUnit: "الوحدة", perUnitHint: "الأسعار بالمليون وحدة، وبالعملة التي يعرضها المزود.",
    provider: "المزود", contextWindow: "نافذة السياق", speed: "السرعة النسبية", cost: "التكلفة النسبية", accessTerm: "طريقة الدفع",
    capabilitiesTitle: "القدرات", capabilitiesHint: "القدرات المعلنة من المزود — تظهر كما هي دون إضافة.",
    capabilities: { reasoning: "استدلال", vision: "رؤية", files: "ملفات", tools: "أدوات", structured_output: "مخرجات مهيكلة" },
    errTitle: "تعذر تحميل صفحة النموذج",
    errBody: "حدث خطأ مؤقت أثناء جلب تفاصيل النموذج — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    backToCatalog: "Model catalog", tryInChat: "Try it in a chat",
    pricingTitle: "Pricing", inputPrice: "Per million input units", outputPrice: "Per million output units",
    perUnit: "Unit", perUnitHint: "Prices are per million units, in the provider’s listed currency.",
    provider: "Provider", contextWindow: "Context window", speed: "Relative speed", cost: "Relative cost", accessTerm: "Payer path",
    capabilitiesTitle: "Capabilities", capabilitiesHint: "Capabilities as declared by the provider — shown as-is, nothing added.",
    capabilities: { reasoning: "Reasoning", vision: "Vision", files: "Files", tools: "Tools", structured_output: "Structured output" },
    errTitle: "Couldn’t load the model page",
    errBody: "A temporary error occurred while fetching model details — try again.",
    retry: "Try again",
  };
}

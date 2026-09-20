"use client";

/* ============================================================
   MDS v4 — Routing rules («قواعد التوجيه»)
   Explains how the workspace picks a model per step, shows
   the current policy as a numbered priority list, and is
   honest about what is not built yet (dictionary.common.
   comingNext). No invented knobs, no fake rules engine.
   ============================================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { CatalogModel } from "@minsaj/contracts";
import { Badge, ErrorState, SkeletonList } from "./primitives";
import { ListRow, PageHeader, PageShell, SectionHead } from "./page-kit";
import { ModelChip } from "./data";
import { modelLabels } from "./mj-models";

export function MjRouting({
  locale, dictionary, policy, models, error,
}: {
  locale: Locale; dictionary: Dictionary;
  policy: { primary: string; fallback: string; payer: "platform_credits" | "byok" };
  models: CatalogModel[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = routingLabels(isAr);
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

  if (error) {
    return (
      <PageShell>
        <PageHeader title={t.title} description={t.desc} />
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

  const byName = new Map(models.map((x) => [x.name, x]));
  const steps = [
    { name: policy.primary, role: t.rolePrimary, rank: 1 },
    { name: policy.fallback, role: t.roleFallback, rank: 2 },
  ];

  return (
    <PageShell>
      <PageHeader
        title={t.title}
        description={t.desc}
        actions={
          <Link href={`/${locale}/app/models`} className="mj-btn mj-btn--ghost mj-btn--sm">
            <Back size={14} />{t.backToCatalog}
          </Link>
        }
      />

      {/* how routing works — plain language, no knobs */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.howTitle} />
        <div className="mj-card mj-card--pad" style={{ display: "grid", gap: 12 }}>
          {t.howSteps.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span className="mj-avatar mj-avatar--sm" aria-hidden style={{ fontFamily: "var(--font-mono)" }}>{i + 1}</span>
              <p className="mj-body-s" style={{ color: "var(--ink-2)" }}>{step}</p>
            </div>
          ))}
          <p className="mj-caption">{t.policyNote}</p>
        </div>
      </section>

      {/* the current policy — a simple priority list */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.policyTitle} action={<Badge tone="outline">{t.workspacePolicy}</Badge>} />
        <div className="mj-list">
          {steps.map((s) => {
            const model = byName.get(s.name);
            return (
              <ListRow
                key={s.name}
                href={model ? `/${locale}/app/models/${model.id}` : undefined}
                leading={<span className="mj-avatar" aria-hidden style={{ fontFamily: "var(--font-mono)" }}>{s.rank}</span>}
                title={<ModelChip name={s.name} provider={model?.provider ?? "—"} />}
                desc={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>{s.role}</span>
                    {model && model.status !== "available" ? (
                      <Badge tone="warning">{m.statusLabels[model.status]}</Badge>
                    ) : null}
                  </span>
                }
                trailing={model ? <Badge tone={s.rank === 1 ? "accent" : "neutral"}>{s.rank === 1 ? t.rolePrimary : t.roleFallback}</Badge> : null}
              />
            );
          })}
        </div>
        <p className="mj-caption">{t.payerNote} — {m.payer[policy.payer]}</p>
      </section>

      {/* honest "coming next" — no fake controls */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.nextTitle} />
        <div className="mj-well" style={{ display: "grid", gap: 10 }}>
          <p className="mj-caption" style={{ color: "var(--ink-2)" }}>{dictionary.common.comingNext}</p>
          {t.nextItems.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Sparkles size={14} aria-hidden style={{ color: "var(--ink-3)" }} />
              <span className="mj-body-s" style={{ flex: "1 1 200px" }}>{item}</span>
              <Badge tone="outline">{t.nextBadge}</Badge>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function routingLabels(isAr: boolean) {
  return isAr ? {
    title: "قواعد التوجيه",
    desc: "كيف تختار مساحة عملك نموذجًا لكل خطوة: أساسي معتمد، ثم بديل عند التعذر — والتكلفة ظاهرة دائمًا.",
    backToCatalog: "فهرس النماذج",
    howTitle: "كيف يعمل التوجيه",
    howSteps: [
      "كل خطوة في التشغيل تُوجَّه إلى النموذج الأساسي المعتمد لمساحة العمل.",
      "إذا تعذر الأساسي أو تجاوز الحد المسموح، تُجرَّب المحاولة عبر النموذج البديل بدل فشل التشغيل.",
      "التبديل يُسجَّل في إيصال التنفيذ مع اسم النموذج ومصدر الدفع والتكلفة الفعلية.",
    ],
    policyNote: "هذه سياسة مساحة العمل الحالية؛ يمكن ضبط سياسة مختلفة لكل وكيل عند الحاجة.",
    policyTitle: "الترتيب الحالي",
    workspacePolicy: "سياسة مساحة العمل",
    rolePrimary: "الأساسي المعتمد", roleFallback: "البديل الاحتياطي",
    payerNote: "مصدر الدفع الافتراضي لهذه السياسة",
    nextTitle: "ما لم يُبنَ بعد",
    nextItems: [
      "قواعد توجيه مخصصة حسب نوع المهمة أو حجم السياق",
      "تجاوزات على مستوى المشروع الواحد",
      "حدود تكلفة تلقائية توجه الخطوات الأغلى نحو البديل",
    ],
    nextBadge: "قادم لاحقًا",
    errTitle: "تعذر تحميل قواعد التوجيه",
    errBody: "حدث خطأ مؤقت أثناء جلب السياسة الحالية — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    title: "Routing rules",
    desc: "How your workspace picks a model per step: a trusted primary, a fallback when it fails — with cost always visible.",
    backToCatalog: "Model catalog",
    howTitle: "How routing works",
    howSteps: [
      "Every step in a run is routed to the workspace’s trusted primary model.",
      "If the primary is unavailable or exceeds its limit, the fallback takes over instead of failing the run.",
      "Each switch is recorded in the execution receipt with the model, payer, and actual cost.",
    ],
    policyNote: "This is the current workspace policy; a different policy can be set per agent when needed.",
    policyTitle: "Current order",
    workspacePolicy: "Workspace policy",
    rolePrimary: "Primary", roleFallback: "Fallback",
    payerNote: "Default payer for this policy",
    nextTitle: "What is not built yet",
    nextItems: [
      "Custom routing rules by task type or context size",
      "Per-project overrides",
      "Automatic budget caps that steer expensive steps to the fallback",
    ],
    nextBadge: "Coming later",
    errTitle: "Couldn’t load routing rules",
    errBody: "A temporary error occurred while fetching the current policy — try again.",
    retry: "Try again",
  };
}

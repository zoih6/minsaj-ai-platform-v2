"use client";

/* ============================================================
   MDS v4 — Billing («الفواتير»)
   Balance card from the home snapshot (the only billing
   data that exists), then honest empty states for payment
   method and invoices — no invented statements.
   ============================================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChartNoAxesColumn, CreditCard, ReceiptText } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { Money } from "@minsaj/contracts";
import { Badge, ErrorState, Progress, SkeletonList } from "./primitives";
import { MoneyView, PageHeader, PageShell, SectionHead } from "./page-kit";

export function MjBilling({
  locale, dictionary, balance, error,
}: {
  locale: Locale; dictionary: Dictionary;
  balance: { available: Money; usedPercent: number; payer: "platform_credits" | "byok" | "mixed" } | null;
  error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = billingLabels(isAr);
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  if (error || !balance) {
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

  return (
    <PageShell>
      <PageHeader
        title={t.title}
        description={t.desc}
        actions={
          <Link href={`/${locale}/app/usage`} className="mj-btn mj-btn--secondary mj-btn--sm">
            <ChartNoAxesColumn size={14} />{t.viewUsage}
          </Link>
        }
      />

      {/* the balance — the one real billing number */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.balanceTitle} action={<Badge tone="outline">{t.payer[balance.payer]}</Badge>} />
        <div className="mj-card mj-stat" style={{ gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span className="mj-stat__label"><CreditCard size={14} />{t.availableLabel}</span>
            <span className="mj-stat__value">
              <MoneyView amountMinor={balance.available.amountMinor} currency={balance.available.currency} locale={locale} />
            </span>
          </div>
          <Progress value={balance.usedPercent} label={t.usedLabel} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span className="mj-stat__meta"><span className="mj-mono" dir="ltr">{balance.usedPercent}%</span> {t.usedSuffix}</span>
            <span className="mj-stat__meta">{t.balanceHint}</span>
          </div>
        </div>
      </section>

      {/* payment method — honest empty */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.methodTitle} />
        <div className="mj-card">
          <div className="mj-state">
            <span className="mj-state__icon" aria-hidden><CreditCard size={20} /></span>
            <h3>{t.methodEmptyTitle}</h3>
            <p>{t.methodEmptyBody}</p>
          </div>
        </div>
      </section>

      {/* invoices — honest empty, coming next */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.invoicesTitle} />
        <div className="mj-card">
          <div className="mj-state">
            <span className="mj-state__icon" aria-hidden><ReceiptText size={20} /></span>
            <h3>{t.invoicesEmptyTitle}</h3>
            <p>{t.invoicesEmptyBody}</p>
            <p className="mj-caption">{dictionary.common.comingNext}</p>
          </div>
        </div>
      </section>

      <p className="mj-caption">{t.hint}</p>
    </PageShell>
  );
}

function billingLabels(isAr: boolean) {
  return isAr ? {
    title: "الفواتير",
    desc: "رصيد مساحة العمل وطريقة الدفع والفواتير — بأرقام حقيقية وحالات صريحة حيث لا بيانات بعد.",
    viewUsage: "أحداث الاستخدام",
    balanceTitle: "الرصيد",
    availableLabel: "الرصيد المتاح",
    usedLabel: "نسبة الاستهلاك من ميزانية الشهر",
    usedSuffix: "مستخدم من ميزانية الشهر",
    balanceHint: "المصروف يُخصم من الرصيد المُدار، ومفاتيحك الخاصة تبقى منفصلة.",
    payer: { platform_credits: "رصيد المنصة", byok: "مفاتيحك الخاصة", mixed: "مصدر مختلط" },
    methodTitle: "طريقة الدفع",
    methodEmptyTitle: "لا توجد وسيلة دفع مسجلة",
    methodEmptyBody: "تسجيل بطاقة أو تحويل مصرفي يُتاح عند أول اشتراك مدفوع في مساحة العمل.",
    invoicesTitle: "الفواتير",
    invoicesEmptyTitle: "لا فواتير بعد",
    invoicesEmptyBody: "تصدر الفاتورة الشهرية عند اكتمال أول دورة اشتراك، وتظهر هنا قابلة للتنزيل.",
    hint: "كل خصم يظهر أيضًا في صفحة الاستخدام مرتبطًا بتشغيله.",
    errTitle: "تعذر تحميل صفحة الفواتير",
    errBody: "حدث خطأ مؤقت أثناء جلب الرصيد — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    title: "Billing",
    desc: "Workspace balance, payment method, and invoices — real numbers, and honest states where no data exists yet.",
    viewUsage: "Usage events",
    balanceTitle: "Balance",
    availableLabel: "Available balance",
    usedLabel: "Usage share of this month’s budget",
    usedSuffix: "used from this month’s budget",
    balanceHint: "Spend draws from the managed balance; your own keys stay separate.",
    payer: { platform_credits: "Platform credits", byok: "Your own keys", mixed: "Mixed payer" },
    methodTitle: "Payment method",
    methodEmptyTitle: "No payment method registered",
    methodEmptyBody: "Registering a card or bank transfer becomes available with the first paid subscription in the workspace.",
    invoicesTitle: "Invoices",
    invoicesEmptyTitle: "No invoices yet",
    invoicesEmptyBody: "The monthly invoice is issued once the first subscription cycle completes, and appears here for download.",
    hint: "Every charge also appears on the usage page, linked to its run.",
    errTitle: "Couldn’t load billing",
    errBody: "A temporary error occurred while fetching the balance — try again.",
    retry: "Try again",
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { HomeSnapshot } from "@minsaj/contracts";
import { getHomeSnapshot } from "@/lib/data/home";
import { MjBilling } from "@/components/mj/mj-billing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الفواتير — منسج" : "Billing — Minsaj",
    description: locale === "ar"
      ? "الرصيد ووسيلة الدفع والفواتير."
      : "Balance, payment method, and invoices.",
  };
}

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  let home: HomeSnapshot | null = null;
  let failed = false;
  try {
    home = await getHomeSnapshot();
  } catch {
    failed = true;
  }

  return (
    <MjBilling
      locale={locale}
      dictionary={dictionary}
      balance={home ? home.balance : null}
      error={failed}
    />
  );
}

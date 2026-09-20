import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { MjLanding } from "@/components/mj/mj-landing";

export default async function MarketingHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <MjLanding locale={locale} dictionary={getDictionary(locale)} />;
}

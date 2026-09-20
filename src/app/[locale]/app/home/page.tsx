import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getHomeSnapshot } from "@/lib/data/home";
import { MjHome } from "@/components/mj/mj-home";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "لك — منسج" : "For you — Minsaj",
    description: locale === "ar" ? "مركز القيادة: ما يعمل الآن وما ينتظرك." : "Your command center: what is running and what needs you.",
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [dictionary, snapshot] = await Promise.all([Promise.resolve(getDictionary(locale)), getHomeSnapshot()]);
  return <MjHome locale={locale} dictionary={dictionary} snapshot={snapshot} />;
}

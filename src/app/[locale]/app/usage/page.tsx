import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjUsage } from "@/components/mj/mj-usage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الاستخدام — منسج" : "Usage — Minsaj",
    description: locale === "ar"
      ? "أحداث استهلاك النماذج مع الوحدات والتكلفة."
      : "Model consumption events with units and cost.",
  };
}

export default async function UsagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  let data: WorkspaceAdminSnapshot | null = null;
  let failed = false;
  try {
    data = await getWorkspaceAdminData();
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return <MjUsage locale={locale} dictionary={dictionary} events={[]} error />;
  }

  return <MjUsage locale={locale} dictionary={dictionary} events={data.usageEvents} />;
}

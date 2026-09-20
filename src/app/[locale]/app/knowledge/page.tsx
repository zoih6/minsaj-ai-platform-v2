import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjKnowledge } from "@/components/mj/mj-knowledge";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المعرفة — منسج" : "Knowledge — Minsaj",
    description: locale === "ar"
      ? "مجموعات المعرفة المفهرسة التي تستند إليها الوكلاء والتدفقات."
      : "Indexed knowledge collections your agents and flows draw on.",
  };
}

export default async function KnowledgePage({ params }: { params: Promise<{ locale: string }> }) {
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
    return <MjKnowledge locale={locale} dictionary={dictionary} collections={[]} sources={[]} error />;
  }

  return (
    <MjKnowledge
      locale={locale}
      dictionary={dictionary}
      collections={data.collections}
      sources={data.sources}
    />
  );
}

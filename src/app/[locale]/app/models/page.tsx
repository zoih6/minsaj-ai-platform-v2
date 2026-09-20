import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjModels } from "@/components/mj/mj-models";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "النماذج — منسج" : "Models — Minsaj",
    description: locale === "ar"
      ? "فهرس النماذج المتاحة مع الحالة والسرعة والتكلفة النسبية."
      : "The model catalog with status, speed, and relative cost.",
  };
}

export default async function ModelsPage({ params }: { params: Promise<{ locale: string }> }) {
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
    return <MjModels locale={locale} dictionary={dictionary} models={[]} error />;
  }

  return <MjModels locale={locale} dictionary={dictionary} models={data.models} />;
}

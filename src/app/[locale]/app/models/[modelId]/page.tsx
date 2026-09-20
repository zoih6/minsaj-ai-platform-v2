import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjModelDetail } from "@/components/mj/mj-model-detail";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تفاصيل النموذج — منسج" : "Model details — Minsaj",
    description: locale === "ar"
      ? "التسعير ونافذة السياق والقدرات لكل نموذج."
      : "Pricing, context window, and capabilities for each model.",
  };
}

export default async function ModelDetailPage({
  params,
}: { params: Promise<{ locale: string; modelId: string }> }) {
  const { locale, modelId } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  let data: WorkspaceAdminSnapshot | null = null;
  let failed = false;
  try {
    data = await getWorkspaceAdminData();
  } catch {
    failed = true;
  }

  const model = data?.models.find((m) => m.id === modelId) ?? null;
  if (!failed && !model) notFound();

  return <MjModelDetail locale={locale} dictionary={dictionary} model={model} error={failed} />;
}

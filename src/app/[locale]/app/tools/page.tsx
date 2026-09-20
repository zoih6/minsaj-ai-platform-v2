import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjTools } from "@/components/mj/mj-tools";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الأدوات — منسج" : "Tools — Minsaj",
    description: locale === "ar"
      ? "فهرس الأدوات مع مستويات الخطورة وحالات الربط."
      : "The tool catalog with risk levels and connection status.",
  };
}

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
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
    return <MjTools locale={locale} dictionary={dictionary} tools={[]} error />;
  }

  return <MjTools locale={locale} dictionary={dictionary} tools={data.tools} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjSkills } from "@/components/mj/mj-skills";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المهارات — منسج" : "Skills — Minsaj",
    description: locale === "ar"
      ? "فهرس المهارات مفتوحة المصدر مع الأذونات وحالة المراجعة."
      : "The open-source skill catalog with permissions and review status.",
  };
}

export default async function SkillsPage({ params }: { params: Promise<{ locale: string }> }) {
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
    return <MjSkills locale={locale} dictionary={dictionary} skills={[]} error />;
  }

  return <MjSkills locale={locale} dictionary={dictionary} skills={data.skills} />;
}

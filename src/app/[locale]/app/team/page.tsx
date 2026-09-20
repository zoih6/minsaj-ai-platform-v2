import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjTeam } from "@/components/mj/mj-team";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الفريق — منسج" : "Team — Minsaj",
    description: locale === "ar"
      ? "أعضاء مساحة العمل وأدوارهم وحالاتهم."
      : "Workspace members, their roles, and status.",
  };
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
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
    return <MjTeam locale={locale} dictionary={dictionary} members={[]} error />;
  }

  return <MjTeam locale={locale} dictionary={dictionary} members={data.members} />;
}

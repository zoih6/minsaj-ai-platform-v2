import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { HomeSnapshot, WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { getHomeSnapshot } from "@/lib/data/home";
import { MjSettings } from "@/components/mj/mj-settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الإعدادات — منسج" : "Settings — Minsaj",
    description: locale === "ar"
      ? "ملفك الشخصي ومظهر مساحة العمل وسياساتها."
      : "Your profile, workspace appearance, and policies.",
  };
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  let admin: WorkspaceAdminSnapshot | null = null;
  let home: HomeSnapshot | null = null;
  let failed = false;
  try {
    [admin, home] = await Promise.all([getWorkspaceAdminData(), getHomeSnapshot()]);
  } catch {
    failed = true;
  }

  const member = admin?.members.find((m) => m.role === "owner") ?? null;

  return (
    <MjSettings
      locale={locale}
      dictionary={dictionary}
      member={member}
      workspaceName={home?.workspace.name ?? null}
      error={failed}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@minsaj/i18n";
import { getAgentData, getWorkspaceAdminData } from "@/lib/data/operations";
import { MjAgentBuilder } from "@/components/mj/mj-agents";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; agentId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تحرير الوكيل — منسج" : "Edit agent — Minsaj",
    description: locale === "ar"
      ? "عدّل التعليمات والحدود؛ الإصدار التالي يُسجَّل عند الحفظ."
      : "Adjust instructions and limits; the next version is recorded on save.",
  };
}

export default async function EditAgentPage({ params }: { params: Promise<{ locale: string; agentId: string }> }) {
  const { locale, agentId } = await params;
  if (!isLocale(locale)) notFound();
  const definition = await getAgentData(agentId);
  if (!definition) notFound();
  const admin = await getWorkspaceAdminData();
  const models = admin.models.map((m) => ({ name: m.name, provider: m.provider }));
  return (
    <MjAgentBuilder
      locale={locale}
      definition={definition}
      models={models}
      isNew={false}
    />
  );
}

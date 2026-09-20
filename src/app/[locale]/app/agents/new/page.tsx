import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@minsaj/i18n";
import { getAgentData, getWorkspaceAdminData } from "@/lib/data/operations";
import { MjAgentBuilder } from "@/components/mj/mj-agents";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "وكيل جديد — منسج" : "New agent — Minsaj",
    description: locale === "ar"
      ? "عرّف الهدف والتعليمات والحدود قبل أول تشغيل."
      : "Define the objective, instructions, and limits before the first run.",
  };
}

export default async function NewAgentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  /* the template carries the workspace defaults (tools, policy, budget);
     identity starts blank so the builder form demonstrates validation. */
  const template = await getAgentData("new");
  if (!template) notFound();
  const definition = {
    ...template,
    objective: { ar: "", en: "" },
    instructions: { ar: "", en: "" },
  };
  const admin = await getWorkspaceAdminData();
  const models = admin.models.map((m) => ({ name: m.name, provider: m.provider }));
  return (
    <MjAgentBuilder
      locale={locale}
      definition={definition}
      models={models}
      isNew
    />
  );
}

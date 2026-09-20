import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@minsaj/i18n";
import { getFlowData } from "@/lib/data/operations";
import { MjFlowEditor } from "@/components/mj/mj-flows";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تدفق جديد — منسج" : "New flow — Minsaj",
    description: locale === "ar"
      ? "اربط العقد لتكوين مسار قابل للتدقيق، ثم اختبره قبل النشر."
      : "Connect nodes into an auditable path, then test it before publishing.",
  };
}

export default async function NewFlowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  /* the template carries a starter chain; identity starts blank so
     the editor form demonstrates validation on blur */
  const base = await getFlowData("new");
  if (!base) notFound();
  const definition = {
    ...base,
    summary: {
      ...base.summary,
      id: "flw_new_demo",
      name: { ar: "تدفق جديد", en: "New flow" },
      description: { ar: "اربط العقد لتكوين مسار قابل للتدقيق.", en: "Connect nodes into an auditable path." },
      status: "draft" as const,
      version: 1,
    },
  };
  return <MjFlowEditor locale={locale} definition={definition} isNew />;
}

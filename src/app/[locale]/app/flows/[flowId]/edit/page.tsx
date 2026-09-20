import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@minsaj/i18n";
import { getFlowData, getOperationsData } from "@/lib/data/operations";
import { MjFlowEditor } from "@/components/mj/mj-flows";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; flowId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تحرير التدفق — منسج" : "Edit flow — Minsaj",
    description: locale === "ar"
      ? "عدّل المسار والإعدادات؛ الإصدار التالي يُسجَّل عند الحفظ."
      : "Adjust the path and settings; the next version is recorded on save.",
  };
}

export default async function EditFlowPage({ params }: { params: Promise<{ locale: string; flowId: string }> }) {
  const { locale, flowId } = await params;
  if (!isLocale(locale)) notFound();
  const [specific, base, operations] = await Promise.all([
    getFlowData(flowId),
    getFlowData("flw_weekly_watch"),
    getOperationsData(),
  ]);
  if (!base) notFound();
  const summary = operations.flows.find((item) => item.id === flowId);
  const definition = specific ?? (summary ? { ...base, summary } : null);
  if (!definition) notFound();
  return <MjFlowEditor locale={locale} definition={definition} isNew={false} />;
}

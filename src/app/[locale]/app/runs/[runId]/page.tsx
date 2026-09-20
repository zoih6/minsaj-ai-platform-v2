import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getOperationsData, getRunData } from "@/lib/data/operations";
import { MjRunDetail } from "@/components/mj/mj-runs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; runId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "التشغيل — منسج" : "Run — Minsaj",
    description: locale === "ar"
      ? "خطوات التشغيل والموافقات والإيصال."
      : "Run steps, approvals, and receipt.",
  };
}

export default async function RunDetailPage({ params }: { params: Promise<{ locale: string; runId: string }> }) {
  const { locale, runId } = await params;
  if (!isLocale(locale)) notFound();
  /* runs without a persisted detail reuse the reference detail with
     their own summary — every row in the list stays navigable */
  const [specific, base, operations] = await Promise.all([
    getRunData(runId),
    getRunData("run_weekly_watch"),
    getOperationsData(),
  ]);
  if (!base) notFound();
  const summary = operations.runs.find((item) => item.id === runId);
  const run = specific ?? (summary
    ? { ...base, summary, approval: summary.status === "waiting_for_approval" ? base.approval : undefined }
    : null);
  if (!run) notFound();
  return <MjRunDetail locale={locale} dictionary={getDictionary(locale)} run={run} />;
}

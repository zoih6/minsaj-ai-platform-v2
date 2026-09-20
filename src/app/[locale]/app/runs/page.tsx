import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getOperationsData } from "@/lib/data/operations";
import { parseScenarioParam } from "@/lib/surface-states";
import { MjRuns } from "@/components/mj/mj-runs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "التشغيلات — منسج" : "Runs — Minsaj",
    description: locale === "ar"
      ? "كل تشغيل بخطواته وحالته وتكلفته — من الخطة إلى الإيصال."
      : "Every run with its steps, status, and cost — from plan to receipt.",
  };
}

export default async function RunsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [operations, scenario] = await Promise.all([getOperationsData(), searchParams]);
  return (
    <MjRuns
      locale={locale}
      dictionary={getDictionary(locale)}
      runs={operations.runs}
      pendingApprovals={operations.pendingApprovalCount}
      scenario={parseScenarioParam(scenario.state)}
    />
  );
}

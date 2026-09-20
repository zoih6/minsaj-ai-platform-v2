import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getOperationsData } from "@/lib/data/operations";
import { parseScenarioParam } from "@/lib/surface-states";
import { MjFlows } from "@/components/mj/mj-flows";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "التدفقات — منسج" : "Flows — Minsaj",
    description: locale === "ar"
      ? "حوّل العمل المتكرر إلى مسار واضح يمكن للفريق اختباره وتكراره."
      : "Turn repeatable work into a path your team can test and repeat.",
  };
}

export default async function FlowsPage({
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
    <MjFlows
      locale={locale}
      dictionary={getDictionary(locale)}
      flows={operations.flows}
      scenario={parseScenarioParam(scenario.state)}
    />
  );
}

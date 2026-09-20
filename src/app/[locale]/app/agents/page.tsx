import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getOperationsData } from "@/lib/data/operations";
import { parseScenarioParam } from "@/lib/surface-states";
import { MjAgents } from "@/components/mj/mj-agents";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الوكلاء — منسج" : "Agents — Minsaj",
    description: locale === "ar"
      ? "وفّر المهام لوكلاء مضبوطين بالأدوات والحدود والموافقات."
      : "Delegate work to agents with explicit tools, limits, and approvals.",
  };
}

export default async function AgentsPage({
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
    <MjAgents
      locale={locale}
      dictionary={getDictionary(locale)}
      agents={operations.agents}
      scenario={parseScenarioParam(scenario.state)}
    />
  );
}

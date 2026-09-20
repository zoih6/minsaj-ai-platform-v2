import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getOperationsData, getRunData } from "@/lib/data/operations";
import { parseScenarioParam } from "@/lib/surface-states";
import { MjProjectDetail } from "@/components/mj/mj-projects";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; projectId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المشروع — منسج" : "Project — Minsaj",
    description: locale === "ar"
      ? "سياق المشروع: الوكلاء والتدفقات والتشغيلات."
      : "Project context: agents, flows, and runs.",
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, projectId } = await params;
  if (!isLocale(locale)) notFound();
  const [operations, scenario] = await Promise.all([getOperationsData(), searchParams]);
  const project = operations.projects.find((p) => p.id === projectId) ?? null;
  const agents = operations.agents.filter((a) => a.projectIds.includes(projectId));
  const flows = operations.flows.filter((f) => f.projectId === projectId);
  /* a run belongs to the project when its persisted detail says so */
  const details = await Promise.all(operations.runs.map((r) => getRunData(r.id)));
  const runs = operations.runs.filter((_, i) => details[i]?.projectId === projectId);
  return (
    <MjProjectDetail
      locale={locale}
      dictionary={getDictionary(locale)}
      project={project}
      agents={agents}
      flows={flows}
      runs={runs}
      scenario={parseScenarioParam(scenario.state)}
    />
  );
}

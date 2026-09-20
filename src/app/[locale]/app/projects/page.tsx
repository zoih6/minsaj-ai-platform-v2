import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { getOperationsData } from "@/lib/data/operations";
import { parseScenarioParam } from "@/lib/surface-states";
import { MjProjects } from "@/components/mj/mj-projects";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المشاريع — منسج" : "Projects — Minsaj",
    description: locale === "ar"
      ? "السياق الذي يجمع محادثاتك ووكلاءك وتدفقاتك لكل هدف."
      : "The shared context for conversations, agents, and flows behind each goal.",
  };
}

export default async function ProjectsPage({
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
    <MjProjects
      locale={locale}
      dictionary={getDictionary(locale)}
      projects={operations.projects}
      scenario={parseScenarioParam(scenario.state)}
    />
  );
}

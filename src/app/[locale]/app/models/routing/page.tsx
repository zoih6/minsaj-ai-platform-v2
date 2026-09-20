import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData, getAgentData } from "@/lib/data/operations";
import { MjRouting } from "@/components/mj/mj-routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "قواعد التوجيه — منسج" : "Routing rules — Minsaj",
    description: locale === "ar"
      ? "سياسة مساحة العمل لاختيار النموذج في كل خطوة."
      : "The workspace policy for picking a model on every step.",
  };
}

export default async function RoutingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  let data: WorkspaceAdminSnapshot | null = null;
  let policy = { primary: "Clarity Pro", fallback: "Sprint Mini", payer: "platform_credits" as const };
  let failed = false;
  try {
    const [admin, agent] = await Promise.all([getWorkspaceAdminData(), getAgentData("agt_market_researcher")]);
    data = admin;
    if (agent) policy = agent.modelPolicy;
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return <MjRouting locale={locale} dictionary={dictionary} policy={policy} models={[]} error />;
  }

  return <MjRouting locale={locale} dictionary={dictionary} policy={policy} models={data.models} />;
}

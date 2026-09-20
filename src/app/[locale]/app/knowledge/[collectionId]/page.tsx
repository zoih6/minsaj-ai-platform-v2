import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@minsaj/i18n";
import type { WorkspaceAdminSnapshot } from "@minsaj/contracts";
import { getWorkspaceAdminData } from "@/lib/data/operations";
import { MjCollectionDetail } from "@/components/mj/mj-collection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "مجموعة معرفة — منسج" : "Knowledge collection — Minsaj",
    description: locale === "ar"
      ? "مصادر المجموعة وحالات الفهرسة."
      : "The collection’s sources and their indexing status.",
  };
}

export default async function CollectionDetailPage({
  params,
}: { params: Promise<{ locale: string; collectionId: string }> }) {
  const { locale, collectionId } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  let data: WorkspaceAdminSnapshot | null = null;
  let failed = false;
  try {
    data = await getWorkspaceAdminData();
  } catch {
    failed = true;
  }

  const collection = data?.collections.find((c) => c.id === collectionId) ?? null;
  if (!failed && !collection) notFound();
  const sources = data && collection ? data.sources.filter((s) => s.collectionId === collectionId) : [];

  return (
    <MjCollectionDetail
      locale={locale}
      dictionary={dictionary}
      collection={collection}
      sources={sources}
      error={failed}
    />
  );
}

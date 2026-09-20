import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary, isLocale } from "@minsaj/i18n";
import { MjChat } from "@/components/mj/mj-chat";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "اسأل وتحدّث — منسج" : "Ask & talk — Minsaj" };
}

export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense fallback={null}>
      <MjChat locale={locale} dictionary={getDictionary(locale)} />
    </Suspense>
  );
}

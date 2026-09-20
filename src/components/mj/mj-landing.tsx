"use client";

/* ============================================================
   MDS v4 — Landing («من سؤال واحد إلى عملٍ منسوج»)
   Narrative: سؤال → خيط → نسيج (question → thread → fabric).
   Flat hero, type-led, one selvage moment, no trust gradient.
   ============================================================ */

import Link from "next/link";
import { Bot, Check, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Workflow } from "lucide-react";
import { MinsajMark, MinsajWordmark } from "@minsaj/ui";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function MjLanding({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const isAr = locale === "ar";
  const m = dictionary.marketing;
  const t = landingLabels(isAr);
  const Arrow = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="mj-landing">
      <nav className="mj-marketing-nav" aria-label={t.nav}>
        <Link href={`/${locale}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MinsajMark size={28} />
          <MinsajWordmark locale={locale} />
        </Link>
        <div className="mj-marketing-nav__links">
          <a href="#weave">{t.howItWorks}</a>
          <Link href={`/${locale}/app/home`}>{dictionary.nav.home}</Link>
          <a href="#trust">{t.trustNav}</a>
        </div>
        <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle locale={locale} />
          <Link href={isAr ? "/en" : "/ar"} prefetch={false} className="mj-btn mj-btn--sm mj-btn--ghost" aria-label={t.language}>
            <bdi>{isAr ? "EN" : "ع"}</bdi>
          </Link>
          <Link href={`/${locale}/app/home`} className="mj-btn mj-btn--primary mj-btn--sm">{m.primary}</Link>
        </div>
      </nav>

      <main className="mj-marketing-main">
        {/* HERO — flat, type-led */}
        <section className="mj-section mj-hero">
          <span className="mj-hero__eyebrow"><Sparkles size={12} />{m.eyebrow}</span>
          <h1>{m.headlineA} <em>{m.headlineB}</em></h1>
          <p className="mj-hero__sub">{m.body}</p>
          <div className="mj-hero__ctas">
            <Link href={`/${locale}/app/home`} className="mj-btn mj-btn--primary mj-btn--lg">{m.primary}</Link>
            <Link href={`/${locale}/app/chat`} className="mj-btn mj-btn--secondary mj-btn--lg">{m.secondary}</Link>
          </div>
          <p className="mj-hero__meta">
            <span>{t.byok}</span><span>·</span><span>{t.rtl}</span><span>·</span><span>{t.approvals}</span>
          </p>
        </section>

        {/* THE WEAVE — one unconventional section: three threads braid into fabric */}
        <section className="mj-section" id="weave" style={{ display: "grid", gap: 24 }}>
          <div style={{ display: "grid", gap: 8, justifyItems: "center", textAlign: "center" }}>
            <h2 className="mj-title-xl">{m.proofTitle}</h2>
            <div className="mj-weave__thread" style={{ inlineSize: "min(320px, 70%)", "--thread": "var(--accent-fill)", "--weave-dir": isAr ? "left" : "right" } as React.CSSProperties} />
          </div>
          <div className="mj-weave">
            <div className="mj-weave__col">
              <div className="mj-weave__step"><MessageCircle size={16} />{t.thread1}</div>
              <article className="mj-card mj-card--pad" style={{ display: "grid", gap: 10 }}>
                <h3 className="mj-title-m">{m.chatTitle}</h3>
                <p className="mj-body-s mj-ink-2">{m.chatBody}</p>
                <div className="mj-well" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="mj-avatar mj-avatar--sm"><bdi dir="ltr">CP</bdi></span>
                  <span className="mj-body-s mj-truncate"><bdi dir="ltr">Clarity Pro · Northstar</bdi></span>
                  <span className="mj-badge mj-badge--outline" style={{ marginInlineStart: "auto" }}><bdi dir="ltr">$0.12</bdi></span>
                </div>
              </article>
            </div>
            <div className="mj-weave__col">
              <div className="mj-weave__step"><Bot size={16} />{t.thread2}</div>
              <article className="mj-card mj-card--pad" style={{ display: "grid", gap: 10 }}>
                <h3 className="mj-title-m">{m.agentTitle}</h3>
                <p className="mj-body-s mj-ink-2">{m.agentBody}</p>
                <div className="mj-well" style={{ display: "grid", gap: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="mj-dot mj-dot--success" />{t.stepPlan}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="mj-dot mj-dot--warning" />{t.stepApproval}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="mj-dot mj-dot--accent" />{t.stepRun}</span>
                </div>
              </article>
            </div>
            <div className="mj-weave__col">
              <div className="mj-weave__step"><Workflow size={16} />{t.thread3}</div>
              <article className="mj-card mj-card--pad" style={{ display: "grid", gap: 10 }}>
                <h3 className="mj-title-m">{m.flowTitle}</h3>
                <p className="mj-body-s mj-ink-2">{m.flowBody}</p>
                <div className="mj-well" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
                  <bdi dir="ltr">watch → compare → review → digest</bdi>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* TRUST — quiet band, no invented metrics */}
        <section className="mj-section mj-cta-band" id="trust" style={{ gap: 16 }}>
          <h2 className="mj-title-l">{t.trustTitle}</h2>
          <ul style={{ display: "grid", gap: 10, justifyItems: "start" }}>
            {[m.trust, t.trust2, t.trust3].map((line) => (
              <li key={line} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mj-avatar mj-avatar--sm" style={{ color: "var(--success)" }}><Check size={13} /></span>
                <span className="mj-body-s">{line}</span>
              </li>
            ))}
          </ul>
          <Link href={`/${locale}/app/home`} className="mj-btn mj-btn--primary mj-btn--lg">{m.primary} <Arrow size={15} /></Link>
        </section>
      </main>

      <footer className="mj-footer">
        <div className="mj-footer__brand">
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}><MinsajMark size={28} /><MinsajWordmark locale={locale} /></span>
          <p className="mj-caption" style={{ maxInlineSize: "34ch" }}>{dictionary.brand.promise}</p>
        </div>
        <div className="mj-footer__col">
          <h4>{t.product}</h4>
          <Link href={`/${locale}/app/chat`}>{dictionary.nav.chat}</Link>
          <Link href={`/${locale}/app/agents`}>{dictionary.nav.agents}</Link>
          <Link href={`/${locale}/app/flows`}>{dictionary.nav.flows}</Link>
        </div>
        <div className="mj-footer__col">
          <h4>{t.workspaceTitle}</h4>
          <Link href={`/${locale}/app/projects`}>{dictionary.nav.projects}</Link>
          <Link href={`/${locale}/app/knowledge`}>{dictionary.nav.knowledge}</Link>
          <Link href={`/${locale}/app/models`}>{dictionary.nav.models}</Link>
        </div>
        <div className="mj-footer__col">
          <h4>{t.legal}</h4>
          <a href="#trust">{t.privacy}</a>
          <a href="#trust">{t.terms}</a>
          <Link href={`/${locale}/app/settings`}>{dictionary.nav.settings}</Link>
        </div>
        <div className="mj-footer__base">
          <span>© 2026 Minsaj</span>
          <span>{t.footerNote}</span>
        </div>
      </footer>
    </div>
  );
}

function landingLabels(isAr: boolean) {
  return isAr ? {
    nav: "التنقل الرئيسي", howItWorks: "كيف يعمل", trustNav: "الثقة والشفافية", language: "التبديل إلى الإنجليزية",
    thread1: "الخيط الأول: اسأل", thread2: "الخيط الثاني: فوّض", thread3: "الخيط الثالث: كرّر",
    stepPlan: "خطة معروضة قبل التنفيذ", stepApproval: "الأثر الخارجي خلف موافقتك", stepRun: "إيصال تنفيذ لكل خطوة",
    trustTitle: "تحكم هادئ، لا مفاجآت",
    trust2: "السياق والتكلفة والموافقات في مكان واحد",
    trust3: "عربي أولًا: واجهة RTL أصلية بخط محكم",
    product: "المنتج", workspaceTitle: "مساحة العمل", legal: "القانوني", privacy: "الخصوصية", terms: "الشروط",
    byok: "BYOK + رصيد منصة", rtl: "RTL أصلي", approvals: "موافقات وإيصالات",
    footerNote: "منسج — منسوج بالأسئلة، لا بالقوالب",
  } : {
    nav: "Primary navigation", howItWorks: "How it works", trustNav: "Trust & transparency", language: "Switch to Arabic",
    thread1: "Thread one: ask", thread2: "Thread two: delegate", thread3: "Thread three: repeat",
    stepPlan: "A plan shown before execution", stepApproval: "External effects behind your approval", stepRun: "An execution receipt per step",
    trustTitle: "Quiet control, no surprises",
    trust2: "Context, cost, and approvals in one place",
    trust3: "Arabic-first: native RTL, disciplined type",
    product: "Product", workspaceTitle: "Workspace", legal: "Legal", privacy: "Privacy", terms: "Terms",
    byok: "BYOK + managed credits", rtl: "Native RTL", approvals: "Approvals & receipts",
    footerNote: "Minsaj — woven by questions, not templates",
  };
}

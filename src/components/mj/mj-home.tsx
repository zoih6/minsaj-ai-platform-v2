"use client";

/* ============================================================
   MDS v4 — Home («لك»)
   Reference implementation of the page anatomy: PageHeader +
   selvage → stat row → activity → work context. All strings
   from the ar/en dictionaries; data from HomeSnapshot contract.
   ============================================================ */

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, Clock, Coins, MessageCircle, Plus, Sparkles, Zap } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { HomeSnapshot } from "@minsaj/contracts";
import { Badge, Button, Progress } from "./primitives";
import { ListRow, PageHeader, PageShell, SectionHead, StatTile, ViewAll, MoneyView } from "./page-kit";
import { ModelChip, RunStatusBadge } from "./data";

export function MjHome({ locale, dictionary, snapshot }: { locale: Locale; dictionary: Dictionary; snapshot: HomeSnapshot }) {
  const t = dictionary.home;
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const labels = homeLabels(isAr);
  const runPath = (id: string) => `/${locale}/app/runs/${id}`;

  return (
    <PageShell>
      <PageHeader
        title={t.greeting}
        description={t.intro}
        actions={
          <>
            <Link href={`/${locale}/app/chat?action=new`} className="mj-btn mj-btn--primary"><Plus size={15} />{t.newChat}</Link>
            <Link href={`/${locale}/app/agents`} className="mj-btn mj-btn--secondary"><Bot size={15} />{t.runAgent}</Link>
            <Link href={`/${locale}/app/flows/new`} className="mj-btn mj-btn--ghost"><Sparkles size={15} />{t.createFlow}</Link>
          </>
        }
      />

      {/* balance / usage — one calm stat band */}
      <div className="mj-grid mj-grid--cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }}>
        <StatTile
          label={t.balance}
          value=""
          icon={<Coins size={14} />}
          meta={t.balanceHint}
        />
        <div className="mj-card mj-stat" style={{ gridColumn: "1 / -1", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span className="mj-stat__label"><Coins size={14} />{t.balance}</span>
            <span className="mj-stat__value"><MoneyView amountMinor={snapshot.balance.available.amountMinor} currency={snapshot.balance.available.currency} locale={locale} /></span>
          </div>
          <Progress value={snapshot.balance.usedPercent} label={t.used} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span className="mj-stat__meta">{snapshot.balance.usedPercent}% {t.used}</span>
            <Badge tone="outline">{labels.payer[snapshot.balance.payer]}</Badge>
          </div>
        </div>
      </div>

      {/* active runs */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.activeRuns} action={<ViewAll href={`/${locale}/app/runs`} label={dictionary.common.viewAll} />} />
        <div className="mj-list">
          {snapshot.activeRuns.map((run) => (
            <ListRow
              key={run.id}
              href={runPath(run.id)}
              leading={<span className="mj-avatar">{run.kind === "agent" ? <Bot size={17} /> : <Sparkles size={17} />}</span>}
              title={run.title[locale]}
              desc={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <RunStatusBadge status={run.status} label={dictionary.status[run.status]} />
                  <span className="mj-mono" dir="ltr">{run.progress ?? 0}%</span>
                </span>
              }
              trailing={<MoneyView amountMinor={run.cost.amountMinor} currency={run.cost.currency} locale={locale} />}
            />
          ))}
        </div>
        <p className="mj-caption">{t.activeRunsHint}</p>
      </section>

      {/* approvals — the trust surface */}
      {snapshot.approvals.length > 0 ? (
        <section style={{ display: "grid", gap: 12 }}>
          <SectionHead title={t.approvals} />
          <div className="mj-list">
            {snapshot.approvals.map((a) => (
              <ListRow
                key={a.id}
                href={runPath(a.runId)}
                leading={<span className="mj-avatar" style={{ color: "var(--warning)" }}><Clock size={17} /></span>}
                title={a.title[locale]}
                desc={<span className="mj-caption">{labels.risk[a.risk]}</span>}
                trailing={<Badge tone="warning">{t.approvalAction}</Badge>}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* recent projects */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.recentProjects} action={<ViewAll href={`/${locale}/app/projects`} label={dictionary.common.viewAll} />} />
        <div className="mj-grid mj-grid--cards">
          {snapshot.recentProjects.map((p) => (
            <Link key={p.id} href={`/${locale}/app/projects/${p.id}`} className="mj-card mj-card--link" style={{ padding: 20, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong className="mj-title-m mj-clamp-2" style={{ flex: 1 }}>{p.name[locale]}</strong>
                {p.activeRuns > 0 ? <Badge tone="accent"><Zap size={11} />{p.activeRuns}</Badge> : null}
              </div>
              <p className="mj-body-s mj-ink-2 mj-clamp-2">{p.description[locale]}</p>
              <p className="mj-caption" style={{ display: "flex", gap: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MessageCircle size={12} />{p.conversations} {t.conversations}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* model guide */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.modelGuide} action={<ViewAll href={`/${locale}/app/models`} label={dictionary.common.viewAll} />} />
        <div className="mj-grid mj-grid--cards">
          {snapshot.suggestedModels.map((m) => (
            <div key={m.id} className="mj-card" style={{ padding: 16, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ModelChip name={m.name} provider={m.provider} />
                {m.status !== "available" ? <Badge tone="warning">{labels.degraded}</Badge> : null}
              </div>
              <p className="mj-caption" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span>{labels.speed[m.relativeSpeed]}</span>
                <span>{labels.cost[m.relativeCost]}</span>
              </p>
              <Link href={`/${locale}/app/chat?model=${m.id}`} className="mj-btn mj-btn--sm mj-btn--secondary" style={{ justifySelf: "start" }}>
                {labels.tryModel} <Arrow size={13} />
              </Link>
            </div>
          ))}
        </div>
        <p className="mj-caption">{t.modelGuideHint}</p>
      </section>
    </PageShell>
  );
}

function homeLabels(isAr: boolean) {
  return isAr ? {
    payer: { platform_credits: "رصيد المنصة", byok: "مفاتيحك الخاصة", mixed: "مصدر مختلط" },
    risk: { write_internal: "تعديل داخلي", external_side_effect: "أثر خارجي", destructive: "إجراء حذّاق" },
    speed: { fast: "سريع", balanced: "متوازن", slow: "عميق" },
    cost: { low: "تكلفة منخفضة", medium: "تكلفة متوسطة", high: "تكلفة مرتفعة" },
    tryModel: "جرّبه في محادثة", degraded: "أداء متذبذب",
  } : {
    payer: { platform_credits: "Platform credits", byok: "Your own keys", mixed: "Mixed payer" },
    risk: { write_internal: "Internal write", external_side_effect: "External effect", destructive: "Destructive" },
    speed: { fast: "Fast", balanced: "Balanced", slow: "Deep" },
    cost: { low: "Low cost", medium: "Medium cost", high: "High cost" },
    tryModel: "Try in a chat", degraded: "Degraded",
  };
}

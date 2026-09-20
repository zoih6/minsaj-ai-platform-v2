"use client";

/* ============================================================
   MDS v4 — Runs («التشغيلات»)
   List: rows (title, kind, status badge, progress bar, cost,
   updatedAt) + status filter + search.
   Detail: steps timeline, approval gate, receipt + cost
   breakdown, event log. Cancel run via confirm dialog.
   ============================================================ */

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, ArrowRight, Ban, Bot, CheckCircle2, Coins, FileDown, ListChecks,
  Sparkles, UserCheck, Workflow, Wrench, Zap,
} from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { RunDetail, RunStep, RunSummary, RunStatus } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { SurfaceStateOverride } from "@/lib/surface-states";
import {
  Badge, Button, Card, Dialog, EmptyState, ErrorState, Progress, SearchInput,
  Segmented, SkeletonList, ToastProvider, useToast,
} from "./primitives";
import {
  MoneyView, PageHeader, PageShell, SectionHead, StatTile,
  TimeAgo, Toolbar,
} from "./page-kit";
import { DefinitionList, PayerBadge, RiskBadge, RunStatusBadge } from "./data";
import "../../app/styles/mj/pages-ops.css";

/* ------------------------------------------------------------------
   Runs list
   ------------------------------------------------------------------ */

const ACTIVE: RunStatus[] = ["queued", "planning", "running"];
const WAITING: RunStatus[] = ["waiting_for_input", "waiting_for_approval"];
const DONE: RunStatus[] = ["completed", "completed_with_warnings", "failed_retryable", "cancelled"];

export function MjRuns({
  locale, dictionary, runs, pendingApprovals, scenario,
}: {
  locale: Locale;
  dictionary: Dictionary;
  runs: RunSummary[];
  pendingApprovals: number;
  scenario: SurfaceStateOverride;
}) {
  const t = runLabels(locale === "ar");
  const [surface, setSurface] = useState<SurfaceStateOverride>(scenario);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "waiting" | "done">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return runs.filter((r) => {
      const matchesQuery = !q || r.title[locale].toLowerCase().includes(q);
      const inGroup =
        filter === "all" ? true :
        filter === "active" ? ACTIVE.includes(r.status) :
        filter === "waiting" ? WAITING.includes(r.status) :
        DONE.includes(r.status);
      return matchesQuery && inGroup;
    });
  }, [runs, query, filter, locale]);

  const activeCount = runs.filter((r) => ACTIVE.includes(r.status)).length;

  return (
    <PageShell>
      <PageHeader
        title={dictionary.nav.runs}
        description={t.pageDesc}
        actions={
          <Link href={`/${locale}/app/agents`} className="mj-btn mj-btn--primary">
            <Zap size={15} />{t.runAction}
          </Link>
        }
      />

      {surface === "loading" ? (
        <SkeletonList rows={6} />
      ) : surface === "error" ? (
        <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => setSurface(null)} retryLabel={t.retry} />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<Zap size={20} />}
          title={t.emptyTitle}
          body={t.emptyBody}
          action={
            <Link href={`/${locale}/app/agents`} className="mj-btn mj-btn--primary">
              <Zap size={15} />{t.runAction}
            </Link>
          }
        />
      ) : (
        <>
          <div className="mj-grid mj-grid--cards">
            <StatTile label={t.statTotal} value={String(runs.length)} icon={<Zap size={14} />} />
            <StatTile label={t.statActive} value={String(activeCount)} icon={<Zap size={14} />} meta={t.statActiveHint} />
            <StatTile label={t.statPending} value={String(pendingApprovals)} icon={<UserCheck size={14} />} meta={t.statPendingHint} />
          </div>

          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchAria} />
            <Segmented
              ariaLabel={t.filterAria}
              value={filter}
              onChange={(v) => setFilter(v as typeof filter)}
              options={[
                { id: "all", label: t.filterAll },
                { id: "active", label: t.filterActive },
                { id: "waiting", label: t.filterWaiting },
                { id: "done", label: t.filterDone },
              ]}
            />
          </Toolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Zap size={20} />}
              title={t.noMatchTitle}
              body={t.noMatchBody}
              action={<Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>{t.clearFilters}</Button>}
            />
          ) : (
            <div className="mj-list">
              {filtered.map((r) => (
                <Link key={r.id} href={`/${locale}/app/runs/${r.id}`} className="mj-run-row">
                  <span className="mj-run-row__top">
                    <span className="mj-avatar" aria-hidden>
                      {r.kind === "agent" ? <Bot size={17} /> : <Workflow size={17} />}
                    </span>
                    <span className="mj-grow" style={{ display: "grid", gap: 2, minWidth: 0 }}>
                      <span className="mj-label mj-clamp-2" style={{ color: "var(--ink)" }}>{r.title[locale]}</span>
                      <span className="mj-run-row__meta">
                        <RunStatusBadge status={r.status} label={dictionary.status[r.status]} />
                        <span className="mj-caption">{r.kind === "agent" ? t.kindAgent : t.kindFlow}</span>
                      </span>
                    </span>
                    <MoneyView amountMinor={r.cost.amountMinor} currency={r.cost.currency} locale={locale} />
                  </span>
                  <span className="mj-run-row__bottom">
                    <Progress value={r.progress ?? 0} label={t.progressLabel} />
                    <span className="mj-mono" dir="ltr">{r.progress ?? 0}%</span>
                    <TimeAgo iso={r.updatedAt} locale={locale} labels={t.ago} />
                  </span>
                </Link>
              ))}
            </div>
          )}
          <p className="mj-caption">{t.listHint}</p>
        </>
      )}
    </PageShell>
  );
}

/* ------------------------------------------------------------------
   Run detail
   ------------------------------------------------------------------ */

export function MjRunDetail({
  locale, dictionary, run,
}: {
  locale: Locale; dictionary: Dictionary; run: RunDetail;
}) {
  return (
    <ToastProvider>
      <RunDetailInner locale={locale} dictionary={dictionary} run={run} />
    </ToastProvider>
  );
}

function RunDetailInner({
  locale, dictionary, run,
}: {
  locale: Locale; dictionary: Dictionary; run: RunDetail;
}) {
  const isAr = locale === "ar";
  const t = runLabels(isAr);
  const toast = useToast();
  const Back = isAr ? ArrowRight : ArrowLeft;

  const [status, setStatus] = useState<RunStatus>(run.summary.status);
  const [decision, setDecision] = useState<"approved" | "denied" | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const approval = run.approval;
  const canCancel = ACTIVE.includes(status);
  const usedPercent = run.receipt.reserved.amountMinor > 0
    ? Math.min(100, Math.round((run.receipt.actual.amountMinor / run.receipt.reserved.amountMinor) * 100))
    : 0;

  function decide(choice: "approved" | "denied") {
    setDecision(choice);
    toast(choice === "approved"
      ? (isAr ? "نُفّذ الإجراء بعد موافقتك." : "The action executed after your approval.")
      : (isAr ? "أُوقف الإجراء، ولم يُرسل شيء." : "The action was stopped; nothing was sent."));
  }

  function confirmCancelRun() {
    setConfirmCancel(false);
    setStatus("cancelled");
    setCancelling(true);
    window.setTimeout(() => {
      setCancelling(false);
      toast(isAr ? "أُلغي التشغيل؛ توقفت كل الخطوات المتبقية." : "Run cancelled; remaining steps stopped.");
    }, 400);
  }

  return (
    <PageShell>
      <PageHeader
        title={run.summary.title[locale]}
        description={run.objective[locale]}
        actions={
          <>
            <Link href={`/${locale}/app/runs`} className="mj-btn mj-btn--ghost">
              <Back size={15} />{t.backToRuns}
            </Link>
            {canCancel ? (
              <Button variant="secondary" loading={cancelling} onClick={() => setConfirmCancel(true)}>
                <Ban size={15} />{t.cancelRun}
              </Button>
            ) : null}
          </>
        }
      />

      {/* summary strip */}
      <Card>
        <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <RunStatusBadge status={status} label={dictionary.status[status]} />
            <Badge tone="outline">{run.summary.kind === "agent" ? t.kindAgent : t.kindFlow}</Badge>
            {run.summary.progress != null ? <span className="mj-mono" dir="ltr">{run.summary.progress}%</span> : null}
            <span style={{ marginInlineStart: "auto" }} className="mj-mono" dir="ltr">{run.summary.id}</span>
          </div>
          <DefinitionList items={[
            { term: t.initiator, value: <bdi>{run.initiator}</bdi> },
            {
              term: t.costSoFar,
              value: (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Coins size={13} />
                  <MoneyView amountMinor={run.summary.cost.amountMinor} currency={run.summary.cost.currency} locale={locale} />
                </span>
              ),
            },
            { term: t.lastUpdate, value: <TimeAgo iso={run.summary.updatedAt} locale={locale} labels={t.ago} /> },
          ]} />
        </div>
      </Card>

      {/* approval gate — the trust surface */}
      {approval ? (
        <section style={{ display: "grid", gap: 12 }}>
          <SectionHead title={t.approvalTitle} />
          <Card>
            <div className="mj-card__header">
              <span className="mj-avatar" style={{ color: "var(--warning)" }} aria-hidden><UserCheck size={17} /></span>
              <span className="mj-card__title mj-clamp-2">{approval.title[locale]}</span>
              <span style={{ marginInlineStart: "auto" }}>
                {decision === null
                  ? <RiskBadge risk={approval.risk} labels={t.risk} />
                  : <Badge tone={decision === "approved" ? "success" : "danger"}>
                      {decision === "approved" ? t.decisionApproved : t.decisionDenied}
                    </Badge>}
              </span>
            </div>
            <div className="mj-card__body" style={{ display: "grid", gap: 12 }}>
              <p className="mj-body-s mj-ink-2">{approval.explanation[locale]}</p>
              <div className="mj-well" style={{ display: "grid", gap: 8 }}>
                <p className="mj-caption">{t.payloadLabel}</p>
                <p className="mj-body-s"><bdi dir="auto">{approval.payloadPreview[locale]}</bdi></p>
                <p className="mj-mono" dir="ltr" style={{ color: "var(--ink-3)", fontSize: 11 }}>{approval.actionDigest}</p>
              </div>
              {decision === null ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button variant="primary" onClick={() => decide("approved")}>
                    <CheckCircle2 size={15} />{t.approveAction}
                  </Button>
                  <Button variant="danger" onClick={() => decide("denied")}>
                    <Ban size={15} />{t.denyAction}
                  </Button>
                </div>
              ) : (
                <p className="mj-caption">
                  {decision === "approved" ? t.afterApproved : t.afterDenied}
                </p>
              )}
            </div>
          </Card>
        </section>
      ) : null}

      {/* steps timeline */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.stepsTitle} action={<Badge tone="outline"><span className="mj-mono">{run.steps.length}</span> {t.stepsWord}</Badge>} />
        <Card className="mj-card--pad" style={{ padding: 20 }}>
          <div className="mj-tl">
            {run.steps.map((step) => (
              <StepItem key={step.id} step={step} locale={locale} t={t} />
            ))}
          </div>
        </Card>
      </section>

      {/* receipt + cost breakdown */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.receiptTitle} />
        <Card>
          <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
            <DefinitionList items={[
              { term: t.modelTerm, value: <span className="mj-badge mj-badge--outline"><bdi dir="ltr">{run.receipt.model}</bdi></span> },
              { term: t.payerTerm, value: <PayerBadge payer={run.receipt.payer === "byok" ? "byok" : "platform_credits"} labels={t.payer} /> },
              { term: t.inputUnits, value: <span className="mj-mono" dir="ltr">{run.receipt.inputUnits.toLocaleString("en-US")}</span> },
              { term: t.outputUnits, value: <span className="mj-mono" dir="ltr">{run.receipt.outputUnits.toLocaleString("en-US")}</span> },
              {
                term: t.toolsTerm,
                value: (
                  <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                    {run.receipt.tools.map((tool) => (
                      <span key={tool} className="mj-badge mj-badge--outline"><bdi dir="ltr">{tool}</bdi></span>
                    ))}
                  </span>
                ),
              },
              {
                term: t.reservedTerm,
                value: <MoneyView amountMinor={run.receipt.reserved.amountMinor} currency={run.receipt.reserved.currency} locale={locale} />,
              },
              {
                term: t.actualTerm,
                value: <MoneyView amountMinor={run.receipt.actual.amountMinor} currency={run.receipt.actual.currency} locale={locale} />,
              },
            ]} />
            <div style={{ display: "grid", gap: 8 }}>
              <Progress value={usedPercent} label={t.usedOfReserved} />
              <p className="mj-caption">
                <span className="mj-mono" dir="ltr">{usedPercent}%</span> {t.usedOfReserved} (
                <MoneyView amountMinor={run.receipt.actual.amountMinor} currency={run.receipt.actual.currency} locale={locale} /> / {" "}
                <MoneyView amountMinor={run.receipt.reserved.amountMinor} currency={run.receipt.reserved.currency} locale={locale} />)
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* event log */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHead title={t.eventsTitle} />
        <Card>
          <div className="mj-card__body" style={{ display: "grid" }}>
            {run.events.map((event) => (
              <div
                key={event.sequence}
                style={{
                  display: "grid", gap: 2, paddingBlock: 10,
                  borderBlockEnd: event.sequence < run.events.length ? "1px solid var(--line)" : undefined,
                }}
              >
                <span className="mj-caption" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="mj-mono" dir="ltr">#{event.sequence}</span>
                  <strong style={{ color: "var(--ink-2)", fontWeight: 600 }}>{event.label[locale]}</strong>
                  <TimeAgo iso={event.occurredAt} locale={locale} labels={t.ago} />
                </span>
                <span className="mj-caption">{event.detail[locale]}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* cancel confirmation */}
      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={t.cancelRun}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>{t.keepRunning}</Button>
            <Button variant="danger" onClick={confirmCancelRun}>{t.cancelRunConfirm}</Button>
          </>
        }
      >
        <p className="mj-body-s mj-ink-2">{t.cancelRunBody}</p>
      </Dialog>
    </PageShell>
  );
}

/* one step in the timeline — icon by kind, tone by status */
function StepItem({ step, locale, t }: { step: RunStep; locale: Locale; t: ReturnType<typeof runLabels> }) {
  const meta = STEP_META[step.kind];
  const Icon = meta.icon;
  const tone =
    step.status === "completed" ? "success" :
    step.status === "running" ? "accent" :
    step.status === "waiting_for_approval" ? "warning" :
    step.status === "failed" ? "danger" : undefined;
  const badgeTone =
    step.status === "completed" ? "success" :
    step.status === "running" ? "accent" :
    step.status === "waiting_for_approval" ? "warning" :
    step.status === "failed" ? "danger" : "neutral";
  return (
    <div className="mj-tl__item">
      <span className="mj-tl__mark" data-tone={tone} data-pulse={step.status === "running" ? "true" : undefined} aria-hidden>
        <Icon size={16} />
      </span>
      <div className="mj-tl__body">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
          <span className="mj-grow" style={{ display: "grid", gap: 2, minWidth: 0 }}>
            <span className="mj-label" style={{ color: "var(--ink)" }}>{step.label[locale]}</span>
            <span className="mj-caption mj-clamp-2">{step.detail[locale]}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flex: "none" }}>
            <Badge tone={badgeTone}>{t.stepStatus[step.status]}</Badge>
            <MoneyView amountMinor={step.cost.amountMinor} currency={step.cost.currency} locale={locale} />
          </span>
        </div>
      </div>
    </div>
  );
}

const STEP_META: Record<RunStep["kind"], { icon: LucideIcon }> = {
  plan: { icon: ListChecks },
  model: { icon: Sparkles },
  tool: { icon: Wrench },
  approval: { icon: UserCheck },
  artifact: { icon: FileDown },
};

/* ------------------------------------------------------------------
   Labels
   ------------------------------------------------------------------ */

function runLabels(isAr: boolean) {
  return isAr ? {
    pageDesc: "كل تشغيل بخطواته وحالته وتكلفته — من الخطة إلى الإيصال.",
    runAction: "شغّل وكيلًا",
    search: "ابحث في التشغيلات…",
    searchAria: "البحث في التشغيلات",
    filterAria: "تصفية التشغيلات",
    filterAll: "الكل",
    filterActive: "نشطة",
    filterWaiting: "تنتظرك",
    filterDone: "منتهية",
    kindAgent: "وكيل",
    kindFlow: "تدفق",
    progressLabel: "نسبة الإنجاز",
    listHint: "التشغيلات التي تنتظر قرارك تظهر بشارة تحذيرية.",
    statTotal: "إجمالي التشغيلات",
    statActive: "تشغيلات نشطة",
    statActiveHint: "تعمل الآن",
    statPending: "بانتظار موافقتك",
    statPendingHint: "أفعال متوقفة عند بوابة الموافقة",
    emptyTitle: "لا تشغيلات بعد",
    emptyBody: "شغّل وكيلًا أو تدفقًا وستظهر هنا خطواته وتكلفته.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو اعرض كل التشغيلات.",
    clearFilters: "مسح عوامل التصفية",
    errorTitle: "تعذر تحميل التشغيلات",
    errorBody: "حدث خلل مؤقت أثناء جلب التشغيلات. بياناتك المحفوظة لم تتأثر.",
    retry: "إعادة المحاولة",
    backToRuns: "العودة إلى التشغيلات",
    cancelRun: "إلغاء التشغيل",
    cancelRunConfirm: "نعم، ألغِ التشغيل",
    cancelRunBody: "ستتوقف الخطوات المتبقية فورًا، ولن تُنفَّذ أي أدوات إضافية. تكلفة الخطوات المنتهية تُسجَّل كما هي.",
    keepRunning: "متابعة التشغيل",
    initiator: "البادئ",
    costSoFar: "التكلفة حتى الآن",
    lastUpdate: "آخر تحديث",
    approvalTitle: "موافقة مطلوبة",
    riskLabel: "أثر خارجي",
    risk: { read: "قراءة فقط", write_internal: "تعديل داخلي", external_side_effect: "أثر خارجي", destructive: "إجراء حذّاق" } as Record<string, string>,
    decisionApproved: "تمت الموافقة",
    decisionDenied: "مرفوض",
    payloadLabel: "معاينة الحمولة",
    approveAction: "الموافقة والإرسال",
    denyAction: "رفض",
    afterApproved: "نُفّذ الإجراء بعد موافقتك، وسجل الخطوة يوثّق ذلك.",
    afterDenied: "أُوقف الإجراء عند البوابة، ولم يُرسل شيء.",
    stepsTitle: "خطوات التنفيذ",
    stepsWord: "خطوة",
    receiptTitle: "التكلفة والإيصال",
    modelTerm: "النموذج",
    payerTerm: "مصدر الدفع",
    inputUnits: "وحدات الإدخال",
    outputUnits: "وحدات الإخراج",
    toolsTerm: "الأدوات المستخدمة",
    reservedTerm: "المبلغ المحجوز",
    actualTerm: "التكلفة الفعلية",
    usedOfReserved: "المستخدم من المحجوز",
    eventsTitle: "سجل الأحداث",
    stepStatus: {
      queued: "في الانتظار",
      running: "قيد التنفيذ",
      completed: "مكتمل",
      waiting_for_approval: "ينتظر موافقة",
      skipped: "تم تجاوزه",
      failed: "فشل",
    } as Record<string, string>,
    payer: { platform_credits: "رصيد المنصة", byok: "مفاتيحك الخاصة", mixed: "مصدر مختلط" } as Record<string, string>,
    ago: { now: "الآن", min: "د", hour: "س", day: "يوم" },
  } : {
    pageDesc: "Every run with its steps, status, and cost — from plan to receipt.",
    runAction: "Run an agent",
    search: "Search runs…",
    searchAria: "Search runs",
    filterAria: "Filter runs",
    filterAll: "All",
    filterActive: "Active",
    filterWaiting: "Needs you",
    filterDone: "Finished",
    kindAgent: "Agent",
    kindFlow: "Flow",
    progressLabel: "Progress",
    listHint: "Runs waiting on your decision carry a warning badge.",
    statTotal: "Total runs",
    statActive: "Active runs",
    statActiveHint: "Running now",
    statPending: "Awaiting your approval",
    statPendingHint: "Actions paused at the approval gate",
    emptyTitle: "No runs yet",
    emptyBody: "Run an agent or a flow and its steps and cost will appear here.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another word or show all runs.",
    clearFilters: "Clear filters",
    errorTitle: "Couldn’t load runs",
    errorBody: "A temporary issue interrupted the fetch. Your saved data is unaffected.",
    retry: "Try again",
    backToRuns: "Back to runs",
    cancelRun: "Cancel run",
    cancelRunConfirm: "Yes, cancel the run",
    cancelRunBody: "Remaining steps stop immediately and no further tools execute. Completed steps are billed as recorded.",
    keepRunning: "Keep running",
    initiator: "Initiator",
    costSoFar: "Cost so far",
    lastUpdate: "Last update",
    approvalTitle: "Approval required",
    riskLabel: "External effect",
    risk: { read: "Read-only", write_internal: "Internal write", external_side_effect: "External effect", destructive: "Destructive" } as Record<string, string>,
    decisionApproved: "Approved",
    decisionDenied: "Denied",
    payloadLabel: "Payload preview",
    approveAction: "Approve and send",
    denyAction: "Deny",
    afterApproved: "The action executed after your approval; the step log records it.",
    afterDenied: "The action stopped at the gate; nothing was sent.",
    stepsTitle: "Execution steps",
    stepsWord: "steps",
    receiptTitle: "Cost and receipt",
    modelTerm: "Model",
    payerTerm: "Payer",
    inputUnits: "Input units",
    outputUnits: "Output units",
    toolsTerm: "Tools used",
    reservedTerm: "Reserved",
    actualTerm: "Actual cost",
    usedOfReserved: "used of reserved",
    eventsTitle: "Event log",
    stepStatus: {
      queued: "Queued",
      running: "Running",
      completed: "Completed",
      waiting_for_approval: "Waiting for approval",
      skipped: "Skipped",
      failed: "Failed",
    } as Record<string, string>,
    payer: { platform_credits: "Platform credits", byok: "Your own keys", mixed: "Mixed payer" } as Record<string, string>,
    ago: { now: "now", min: "m", hour: "h", day: "d" },
  };
}

"use client";

/* ============================================================
   MDS v4 — Agents («الوكلاء»)
   List: rows (name, description, status, model, tools, runs).
   Builder: identity + objective + instructions + model policy +
   tools (risk badges) + approval policy + budget — validate on
   blur, errors clear on fix, submit shows loading.
   ============================================================ */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Bot, CheckCircle2, Coins, Plus, ShieldCheck, Wrench, Zap,
} from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { AgentDefinition, AgentSummary, ToolRisk } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { SurfaceStateOverride } from "@/lib/surface-states";
import {
  Badge, Button, Card, Checkbox, EmptyState, ErrorState, Field, Input, SearchInput,
  Segmented, Select, SkeletonList, Textarea, ToastProvider, useToast,
} from "./primitives";
import {
  ListRow, PageHeader, PageShell, StatTile, TimeAgo, Toolbar,
} from "./page-kit";
import { ModelChip, RiskBadge } from "./data";
import "../../app/styles/mj/pages-ops.css";

/* ------------------------------------------------------------------
   Agents list
   ------------------------------------------------------------------ */

export function MjAgents({
  locale, dictionary, agents, scenario,
}: {
  locale: Locale; dictionary: Dictionary; agents: AgentSummary[]; scenario: SurfaceStateOverride;
}) {
  const t = agentLabels(locale === "ar");
  const [surface, setSurface] = useState<SurfaceStateOverride>(scenario);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      const matchesQuery = !q ||
        a.name[locale].toLowerCase().includes(q) ||
        a.description[locale].toLowerCase().includes(q);
      const matchesFilter = filter === "all" || a.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [agents, query, filter, locale]);

  const published = agents.filter((a) => a.status === "published").length;
  const totalRuns = agents.reduce((sum, a) => sum + a.runCount, 0);

  return (
    <PageShell>
      <PageHeader
        title={dictionary.nav.agents}
        description={t.pageDesc}
        actions={
          <Link href={`/${locale}/app/agents/new`} className="mj-btn mj-btn--primary">
            <Plus size={15} />{t.newAgent}
          </Link>
        }
      />

      {surface === "loading" ? (
        <SkeletonList rows={5} />
      ) : surface === "error" ? (
        <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => setSurface(null)} retryLabel={t.retry} />
      ) : agents.length === 0 ? (
        <EmptyState
          icon={<Bot size={20} />}
          title={t.emptyTitle}
          body={t.emptyBody}
          action={
            <Link href={`/${locale}/app/agents/new`} className="mj-btn mj-btn--primary">
              <Plus size={15} />{t.newAgent}
            </Link>
          }
        />
      ) : (
        <>
          <div className="mj-grid mj-grid--cards">
            <StatTile label={t.statAgents} value={String(agents.length)} icon={<Bot size={14} />} />
            <StatTile label={t.statPublished} value={String(published)} icon={<CheckCircle2 size={14} />} />
            <StatTile label={t.statRuns} value={String(totalRuns)} icon={<Zap size={14} />} meta={t.statRunsHint} />
          </div>

          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchAria} />
            <Segmented
              ariaLabel={t.filterAria}
              value={filter}
              onChange={(v) => setFilter(v as typeof filter)}
              options={[
                { id: "all", label: t.filterAll },
                { id: "published", label: t.filterPublished },
                { id: "draft", label: t.filterDraft },
              ]}
            />
          </Toolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Bot size={20} />}
              title={t.noMatchTitle}
              body={t.noMatchBody}
              action={<Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>{t.clearFilters}</Button>}
            />
          ) : (
            <div className="mj-list">
              {filtered.map((a) => (
                <ListRow
                  key={a.id}
                  href={`/${locale}/app/agents/${a.id}/edit`}
                  leading={<span className="mj-avatar"><Bot size={17} /></span>}
                  title={a.name[locale]}
                  desc={
                    <span style={{ display: "grid", gap: 4 }}>
                      <span className="mj-clamp-2">{a.description[locale]}</span>
                      <span className="mj-caption" style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span className="mj-badge mj-badge--outline"><bdi dir="ltr">{a.model}</bdi></span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Wrench size={11} /><span className="mj-mono">{a.toolCount}</span> {t.toolsWord}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Zap size={11} /><span className="mj-mono">{a.runCount}</span> {t.runsWord}
                        </span>
                        <TimeAgo iso={a.updatedAt} locale={locale} labels={t.ago} />
                      </span>
                    </span>
                  }
                  trailing={<Badge tone={a.status === "published" ? "success" : a.status === "draft" ? "neutral" : "outline"}>{t.status[a.status]}</Badge>}
                />
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
   Agent builder — shared by /agents/new and /agents/[agentId]/edit
   ------------------------------------------------------------------ */

type BuilderModels = { name: string; provider: string }[];

export function MjAgentBuilder({
  locale, definition, models, isNew,
}: {
  locale: Locale; definition: AgentDefinition; models: BuilderModels; isNew: boolean;
}) {
  return (
    <ToastProvider>
      <AgentBuilderInner locale={locale} definition={definition} models={models} isNew={isNew} />
    </ToastProvider>
  );
}

function AgentBuilderInner({
  locale, definition, models, isNew,
}: {
  locale: Locale; definition: AgentDefinition; models: BuilderModels; isNew: boolean;
}) {
  const isAr = locale === "ar";
  const t = agentLabels(isAr);
  const toast = useToast();
  const Back = isAr ? ArrowRight : ArrowLeft;

  const [name, setName] = useState(isNew ? "" : definition.summary.name[locale]);
  const [objective, setObjective] = useState(isNew ? "" : definition.objective[locale]);
  const [instructions, setInstructions] = useState(isNew ? "" : definition.instructions[locale]);
  const [primary, setPrimary] = useState(definition.modelPolicy.primary);
  const [fallback, setFallback] = useState(definition.modelPolicy.fallback);
  const [payer, setPayer] = useState<"platform_credits" | "byok">(definition.modelPolicy.payer);
  const [tools, setTools] = useState(definition.tools.map((tool) => ({ ...tool })));
  const [approval, setApproval] = useState(definition.approvalPolicy);
  const [budget, setBudget] = useState((definition.budgetLimit.amountMinor / 100).toFixed(2));
  const [touched, setTouched] = useState({ name: false, objective: false, instructions: false, budget: false });
  const [saving, setSaving] = useState(false);

  const nameError = touched.name && name.trim().length < 2 ? t.errName : undefined;
  const objectiveError = touched.objective && objective.trim().length < 10 ? t.errObjective : undefined;
  const instructionsError = touched.instructions && instructions.trim().length < 20 ? t.errInstructions : undefined;
  const budgetValue = Number(budget);
  const budgetError = touched.budget && (!(budgetValue > 0) ? t.errBudget : undefined);

  const enabledTools = tools.filter((tool) => tool.enabled);
  const riskyTools = enabledTools.filter((tool) => tool.risk !== "read");

  function submit() {
    setTouched({ name: true, objective: true, instructions: true, budget: true });
    const invalid =
      name.trim().length < 2 ||
      objective.trim().length < 10 ||
      instructions.trim().length < 20 ||
      !(Number(budget) > 0);
    if (invalid) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast(isAr
        ? (isNew ? "أُنشئ الوكيل في هذه المعاينة." : "حُفظت تغييرات الوكيل.")
        : (isNew ? "Agent created in this preview." : "Agent changes saved."));
    }, 800);
  }

  return (
    <PageShell>
      <PageHeader
        title={isNew ? t.newAgentTitle : name || definition.summary.name[locale]}
        description={isNew ? t.newAgentDesc : t.editAgentDesc}
        actions={
          <>
            <Link href={`/${locale}/app/agents`} className="mj-btn mj-btn--ghost">
              <Back size={15} />{t.backToAgents}
            </Link>
            <Button variant="primary" loading={saving} onClick={submit}>
              {isNew ? t.createAgent : t.saveAgent}
            </Button>
          </>
        }
      />

      {!isNew ? (
        <p className="mj-caption" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="mj-mono" dir="ltr">v{definition.summary.version}</span>
          <span dir="ltr">{definition.summary.id}</span>
          <Badge tone={definition.summary.status === "published" ? "success" : "neutral"}>
            {t.status[definition.summary.status]}
          </Badge>
        </p>
      ) : null}

      <div className="mj-cols mj-cols--split">
        {/* main column — identity, objective, instructions */}
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <Card>
            <div className="mj-card__header"><span className="mj-card__title">{t.identityTitle}</span></div>
            <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
              <Field label={t.nameField} htmlFor="agt-name" error={nameError} hint={t.nameHint}>
                <Input
                  id="agt-name"
                  value={name}
                  dir="auto"
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                  aria-invalid={nameError ? true : undefined}
                />
              </Field>
              <Field label={t.objectiveField} htmlFor="agt-objective" error={objectiveError} hint={t.objectiveHint}>
                <Textarea
                  id="agt-objective"
                  value={objective}
                  dir="auto"
                  style={{ minHeight: 72 }}
                  onChange={(e) => setObjective(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, objective: true }))}
                  aria-invalid={objectiveError ? true : undefined}
                />
              </Field>
              <Field label={t.instructionsField} htmlFor="agt-instructions" error={instructionsError} hint={t.instructionsHint}>
                <Textarea
                  id="agt-instructions"
                  value={instructions}
                  dir="auto"
                  style={{ minHeight: 140 }}
                  onChange={(e) => setInstructions(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, instructions: true }))}
                  aria-invalid={instructionsError ? true : undefined}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* aside — model policy, tools, guardrails */}
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <Card>
            <div className="mj-card__header"><span className="mj-card__title">{t.modelTitle}</span></div>
            <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
              <Field label={t.primaryModel} htmlFor="agt-primary">
                <Select id="agt-primary" value={primary} onChange={(e) => setPrimary(e.target.value)}>
                  {models.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </Select>
              </Field>
              <Field label={t.fallbackModel} htmlFor="agt-fallback" hint={t.fallbackHint}>
                <Select id="agt-fallback" value={fallback} onChange={(e) => setFallback(e.target.value)}>
                  {models.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </Select>
              </Field>
              <div className="mj-field">
                <span className="mj-field__hint" style={{ marginBottom: -4 }}>{t.payerLabel}</span>
                <Segmented
                  ariaLabel={t.payerLabel}
                  value={payer}
                  onChange={(v) => setPayer(v as typeof payer)}
                  options={[
                    { id: "platform_credits", label: t.payer.platform_credits },
                    { id: "byok", label: t.payer.byok },
                  ]}
                />
              </div>
              <p className="mj-caption" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {t.currentModel} <ModelChip name={primary} provider={models.find((m) => m.name === primary)?.provider ?? ""} />
              </p>
            </div>
          </Card>

          <Card>
            <div className="mj-card__header">
              <span className="mj-card__title">{t.toolsTitle}</span>
              <Badge tone="neutral"><span className="mj-mono">{enabledTools.length}</span> / <span className="mj-mono">{tools.length}</span></Badge>
            </div>
            <div className="mj-card__body">
              {tools.map((tool) => (
                <div key={tool.id} className="mj-tool-row">
                  <Checkbox
                    checked={tool.enabled}
                    onCheckedChange={(v) => setTools((prev) => prev.map((x) => (x.id === tool.id ? { ...x, enabled: v } : x)))}
                    label={tool.name[locale]}
                  />
                  <span className="mj-tool-row__id">
                    <span className="mj-label" style={{ color: "var(--ink)" }}>{tool.name[locale]}</span>
                  </span>
                  <RiskBadge risk={tool.risk} labels={t.risk} />
                </div>
              ))}
              <p className="mj-caption" style={{ paddingBlockStart: 12 }}>{t.toolsHint}</p>
            </div>
          </Card>

          <Card>
            <div className="mj-card__header"><span className="mj-card__title">{t.guardrailsTitle}</span></div>
            <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
              <Field label={t.approvalField} htmlFor="agt-approval" hint={t.approvalHints[approval]}>
                <Select id="agt-approval" value={approval} onChange={(e) => setApproval(e.target.value as typeof approval)}>
                  <option value="always_external">{t.approval.always_external}</option>
                  <option value="workspace_policy">{t.approval.workspace_policy}</option>
                  <option value="manual_only">{t.approval.manual_only}</option>
                </Select>
              </Field>
              <Field label={t.budgetField} htmlFor="agt-budget" error={budgetError} hint={t.budgetHint}>
                <div className="mj-money-input">
                  <Input
                    id="agt-budget"
                    type="number"
                    min={0.1}
                    step={0.1}
                    dir="ltr"
                    className="mj-mono"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, budget: true }))}
                    aria-invalid={budgetError ? true : undefined}
                  />
                  <span className="mj-badge mj-badge--outline"><bdi dir="ltr">USD</bdi></span>
                </div>
              </Field>
              {riskyTools.length > 0 ? (
                <div className="mj-well" style={{ display: "grid", gap: 8 }}>
                  <p className="mj-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} />{t.riskySummary}
                  </p>
                  <p className="mj-caption">
                    {t.riskyBody}
                  </p>
                </div>
              ) : (
                <div className="mj-well">
                  <p className="mj-caption">{t.readOnlySummary}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBlockStart: 4 }}>
        <Link href={`/${locale}/app/agents`} className="mj-btn mj-btn--ghost"><Back size={15} />{t.backToAgents}</Link>
        <Button variant="primary" loading={saving} onClick={submit}>{isNew ? t.createAgent : t.saveAgent}</Button>
      </div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------
   Labels
   ------------------------------------------------------------------ */

function agentLabels(isAr: boolean) {
  return isAr ? {
    pageDesc: "وفّر المهام لوكلاء مضبوطين بالأدوات والحدود والموافقات.",
    newAgent: "وكيل جديد",
    search: "ابحث في الوكلاء…",
    searchAria: "البحث في الوكلاء",
    filterAria: "تصفية الوكلاء",
    filterAll: "الكل",
    filterPublished: "منشور",
    filterDraft: "مسودة",
    toolsWord: "أدوات",
    runsWord: "تشغيل",
    listHint: "الأدوات القارئة تعمل مباشرة؛ وأي أداة ذات أثر خارجي تنتظر موافقتك.",
    statAgents: "الوكلاء",
    statPublished: "منشورة",
    statRuns: "إجمالي التشغيلات",
    statRunsHint: "عبر كل الوكلاء",
    emptyTitle: "لا وكلاء بعد",
    emptyBody: "عرّف وكيلًا أولًا: هدف واضح وتعليمات وحدود صريحة.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو اعرض كل الوكلاء.",
    clearFilters: "مسح عوامل التصفية",
    errorTitle: "تعذر تحميل الوكلاء",
    errorBody: "حدث خلل مؤقت أثناء جلب الوكلاء. بياناتك المحفوظة لم تتأثر.",
    retry: "إعادة المحاولة",
    newAgentTitle: "وكيل جديد",
    newAgentDesc: "عرّف الهدف والتعليمات والحدود قبل أول تشغيل.",
    editAgentDesc: "عدّل التعليمات والحدود؛ الإصدار التالي يُسجَّل عند الحفظ.",
    backToAgents: "العودة إلى الوكلاء",
    createAgent: "إنشاء الوكيل",
    saveAgent: "حفظ التغييرات",
    identityTitle: "الهوية والهدف",
    nameField: "اسم الوكيل",
    nameHint: "اسم يصف المسؤولية لا التقنية.",
    objectiveField: "الهدف",
    objectiveHint: "جملة واحدة تصف النتيجة النهائية المطلوبة.",
    instructionsField: "التعليمات",
    instructionsHint: "اذكر المهمة والمنهج ومتى يجب أن يتوقف الوكيل ويسأل.",
    errName: "الاسم مطلوب — حرفان على الأقل.",
    errObjective: "الهدف مطلوب — عشرة أحرف على الأقل.",
    errInstructions: "التعليمات مطلوبة — عشرون حرفًا على الأقل.",
    errBudget: "أدخل سقفًا أكبر من صفر.",
    modelTitle: "النموذج والدفع",
    primaryModel: "النموذج الأساسي",
    fallbackModel: "النموذج الاحتياطي",
    fallbackHint: "يُستخدم تلقائيًا إن تعذر النموذج الأساسي.",
    payerLabel: "مصدر الدفع",
    payer: { platform_credits: "رصيد المنصة", byok: "مفاتيحك الخاصة" } as Record<string, string>,
    currentModel: "النموذج الفعلي:",
    toolsTitle: "الأدوات",
    toolsHint: "امنح أقل قدر يكفي المهمة — كل أداة تُسجَّل في سجل التشغيل.",
    guardrailsTitle: "الموافقات والميزانية",
    approvalField: "سياسة الموافقة",
    approval: {
      always_external: "موافقة خارجية دائمًا",
      workspace_policy: "سياسة مساحة العمل",
      manual_only: "تشغيل يدوي فقط",
    } as Record<string, string>,
    approvalHints: {
      always_external: "كل أداة ذات أثر خارجي تنتظر موافقة بشرية.",
      workspace_policy: "تتبع سياسة مساحة العمل المعتمدة.",
      manual_only: "لا يبدأ التشغيل إلا بطلب صريح منك.",
    } as Record<string, string>,
    budgetField: "سقف التكلفة لكل تشغيل (دولار)",
    budgetHint: "يتوقف التشغيل عند بلوغ السقف دون تجاوز.",
    riskySummary: "أدوات تنتظر موافقتك",
    riskyBody: "الأدوات المفعّلة ذات الأثر الخارجي أو الداخلي ستتوقف عند بوابة الموافقة قبل التنفيذ.",
    readOnlySummary: "كل الأدوات المفعّلة للقراءة فقط — لا أثر خارجيًا ولا تعديلًا دون قرارك.",
    risk: {
      read: "قراءة فقط",
      write_internal: "تعديل داخلي",
      external_side_effect: "أثر خارجي",
      destructive: "إجراء حذّاق",
    } as Record<ToolRisk, string>,
    status: { draft: "مسودة", published: "منشور", archived: "مؤرشف" } as Record<string, string>,
    ago: { now: "الآن", min: "د", hour: "س", day: "يوم" },
  } : {
    pageDesc: "Delegate work to agents with explicit tools, limits, and approvals.",
    newAgent: "New agent",
    search: "Search agents…",
    searchAria: "Search agents",
    filterAria: "Filter agents",
    filterAll: "All",
    filterPublished: "Published",
    filterDraft: "Draft",
    toolsWord: "tools",
    runsWord: "runs",
    listHint: "Read-only tools run directly; anything with external impact waits for your approval.",
    statAgents: "Agents",
    statPublished: "Published",
    statRuns: "Total runs",
    statRunsHint: "Across all agents",
    emptyTitle: "No agents yet",
    emptyBody: "Define your first agent: a clear objective, instructions, and explicit limits.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another word or show all agents.",
    clearFilters: "Clear filters",
    errorTitle: "Couldn’t load agents",
    errorBody: "A temporary issue interrupted the fetch. Your saved data is unaffected.",
    retry: "Try again",
    newAgentTitle: "New agent",
    newAgentDesc: "Define the objective, instructions, and limits before the first run.",
    editAgentDesc: "Adjust instructions and limits; the next version is recorded on save.",
    backToAgents: "Back to agents",
    createAgent: "Create agent",
    saveAgent: "Save changes",
    identityTitle: "Identity and objective",
    nameField: "Agent name",
    nameHint: "Name the responsibility, not the technology.",
    objectiveField: "Objective",
    objectiveHint: "One sentence describing the required final outcome.",
    instructionsField: "Instructions",
    instructionsHint: "State the job, the method, and when the agent must stop and ask.",
    errName: "Name is required — at least 2 characters.",
    errObjective: "Objective is required — at least 10 characters.",
    errInstructions: "Instructions are required — at least 20 characters.",
    errBudget: "Enter a cap greater than zero.",
    modelTitle: "Model and payer",
    primaryModel: "Primary model",
    fallbackModel: "Fallback model",
    fallbackHint: "Used automatically if the primary model is unavailable.",
    payerLabel: "Payer",
    payer: { platform_credits: "Platform credits", byok: "Your own keys" } as Record<string, string>,
    currentModel: "Active model:",
    toolsTitle: "Tools",
    toolsHint: "Grant the minimum the job needs — every tool is recorded in the run log.",
    guardrailsTitle: "Approvals and budget",
    approvalField: "Approval policy",
    approval: {
      always_external: "Always external approval",
      workspace_policy: "Workspace policy",
      manual_only: "Manual start only",
    } as Record<string, string>,
    approvalHints: {
      always_external: "Every tool with external impact waits for a human approval.",
      workspace_policy: "Follows the approved workspace policy.",
      manual_only: "The run only starts on your explicit request.",
    } as Record<string, string>,
    budgetField: "Cost cap per run (USD)",
    budgetHint: "The run stops at the cap without overage.",
    riskySummary: "Tools that wait for you",
    riskyBody: "Enabled tools with internal or external impact pause at the approval gate before executing.",
    readOnlySummary: "All enabled tools are read-only — no external effect and no change without your decision.",
    risk: {
      read: "Read-only",
      write_internal: "Internal write",
      external_side_effect: "External effect",
      destructive: "Destructive",
    } as Record<ToolRisk, string>,
    status: { draft: "Draft", published: "Published", archived: "Archived" } as Record<string, string>,
    ago: { now: "now", min: "m", hour: "h", day: "d" },
  };
}

"use client";

/* ============================================================
   MDS v4 — Flows («التدفقات»)
   List: rows (name, description, status, nodes, runs, active).
   Editor: node chain visual (the thread) + editable settings
   panel — flow identity, selected node, validation summary.
   ============================================================ */

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, ArrowRight, Bot, CircleAlert, CircleCheck, LogIn, Plus, Send,
  Shuffle, Trash2, UserCheck, Workflow, Zap,
} from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { FlowDefinition, FlowNode, FlowSummary } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { SurfaceStateOverride } from "@/lib/surface-states";
import {
  Badge, Button, Card, EmptyState, ErrorState, Field, Input, SearchInput,
  Segmented, Select, SkeletonList, Textarea, ToastProvider, useToast,
} from "./primitives";
import {
  ListRow, PageHeader, PageShell, SectionHead, StatTile, TimeAgo, Toolbar,
} from "./page-kit";
import "../../app/styles/mj/pages-ops.css";

/* ------------------------------------------------------------------
   Flows list
   ------------------------------------------------------------------ */

export function MjFlows({
  locale, dictionary, flows, scenario,
}: {
  locale: Locale; dictionary: Dictionary; flows: FlowSummary[]; scenario: SurfaceStateOverride;
}) {
  const t = flowLabels(locale === "ar");
  const [surface, setSurface] = useState<SurfaceStateOverride>(scenario);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flows.filter((f) => {
      const matchesQuery = !q ||
        f.name[locale].toLowerCase().includes(q) ||
        f.description[locale].toLowerCase().includes(q);
      const matchesFilter = filter === "all" || f.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [flows, query, filter, locale]);

  const activeRuns = flows.reduce((sum, f) => sum + f.activeRuns, 0);
  const totalRuns = flows.reduce((sum, f) => sum + f.runCount, 0);

  return (
    <PageShell>
      <PageHeader
        title={dictionary.nav.flows}
        description={t.pageDesc}
        actions={
          <Link href={`/${locale}/app/flows/new`} className="mj-btn mj-btn--primary">
            <Plus size={15} />{t.newFlow}
          </Link>
        }
      />

      {surface === "loading" ? (
        <SkeletonList rows={5} />
      ) : surface === "error" ? (
        <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => setSurface(null)} retryLabel={t.retry} />
      ) : flows.length === 0 ? (
        <EmptyState
          icon={<Workflow size={20} />}
          title={t.emptyTitle}
          body={t.emptyBody}
          action={
            <Link href={`/${locale}/app/flows/new`} className="mj-btn mj-btn--primary">
              <Plus size={15} />{t.newFlow}
            </Link>
          }
        />
      ) : (
        <>
          <div className="mj-grid mj-grid--cards">
            <StatTile label={t.statFlows} value={String(flows.length)} icon={<Workflow size={14} />} />
            <StatTile label={t.statActive} value={String(activeRuns)} icon={<Zap size={14} />} meta={t.statActiveHint} />
            <StatTile label={t.statRuns} value={String(totalRuns)} icon={<Zap size={14} />} />
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
              icon={<Workflow size={20} />}
              title={t.noMatchTitle}
              body={t.noMatchBody}
              action={<Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>{t.clearFilters}</Button>}
            />
          ) : (
            <div className="mj-list">
              {filtered.map((f) => (
                <ListRow
                  key={f.id}
                  href={`/${locale}/app/flows/${f.id}/edit`}
                  leading={<span className="mj-avatar"><Workflow size={17} /></span>}
                  title={f.name[locale]}
                  desc={
                    <span style={{ display: "grid", gap: 4 }}>
                      <span className="mj-clamp-2">{f.description[locale]}</span>
                      <span className="mj-caption" style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span><span className="mj-mono">{f.nodeCount}</span> {t.nodesWord}</span>
                        <span><span className="mj-mono">{f.runCount}</span> {t.runsWord}</span>
                        <TimeAgo iso={f.updatedAt} locale={locale} labels={t.ago} />
                      </span>
                    </span>
                  }
                  trailing={
                    <>
                      {f.activeRuns > 0 ? (
                        <Badge tone="accent"><Zap size={11} /><span className="mj-mono">{f.activeRuns}</span></Badge>
                      ) : null}
                      <Badge tone={f.status === "published" ? "success" : f.status === "draft" ? "neutral" : "outline"}>
                        {t.status[f.status]}
                      </Badge>
                    </>
                  }
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
   Flow editor — shared by /flows/new and /flows/[flowId]/edit
   ------------------------------------------------------------------ */

export function MjFlowEditor({
  locale, definition, isNew,
}: {
  locale: Locale; definition: FlowDefinition; isNew: boolean;
}) {
  return (
    <ToastProvider>
      <FlowEditorInner locale={locale} definition={definition} isNew={isNew} />
    </ToastProvider>
  );
}

function FlowEditorInner({
  locale, definition, isNew,
}: {
  locale: Locale; definition: FlowDefinition; isNew: boolean;
}) {
  const isAr = locale === "ar";
  const t = flowLabels(isAr);
  const toast = useToast();
  const Back = isAr ? ArrowRight : ArrowLeft;

  const [name, setName] = useState(isNew ? "" : definition.summary.name[locale]);
  const [description, setDescription] = useState(definition.summary.description[locale]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(definition.summary.status);
  const [nodes, setNodes] = useState<FlowNode[]>(definition.nodes.map((n) => ({ ...n })));
  const [selectedId, setSelectedId] = useState<string | null>(definition.nodes[0]?.id ?? null);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedNode, setTouchedNode] = useState(false);
  const [saving, setSaving] = useState(false);

  /* derived with self-healing fallback: a stale selection id (possible
     after batched double-events) must never blank the settings panel */
  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0] ?? null;
  const nameError = touchedName && name.trim().length < 2 ? t.errName : undefined;
  const nodeError = touchedNode && selected && selected.label[locale].trim().length < 2 ? t.errNode : undefined;

  function patchSelected(patch: Partial<Pick<FlowNode, "label" | "description">>) {
    setNodes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n)));
  }

  function addNode(type: FlowNode["type"]) {
    const id = `node_${type}_${Date.now().toString(36)}`;
    const meta = NODE_META[type];
    const node: FlowNode = {
      id,
      type,
      label: { ar: meta.labelAr, en: meta.labelEn },
      description: { ar: "", en: "" },
    };
    setNodes((prev) => [...prev, node]);
    setSelectedId(id);
    setTouchedNode(false);
  }

  function removeSelected() {
    if (!selectedId) return;
    /* value-form update (not updater-form): a batched second click recomputes
       the same remainder instead of resurrecting the deleted id as selection */
    const rest = nodes.filter((n) => n.id !== selectedId);
    setNodes(rest);
    setSelectedId(rest[0]?.id ?? null);
  }

  function submit() {
    setTouchedName(true);
    setTouchedNode(true);
    if (name.trim().length < 2 || nodes.some((n) => n.label[locale].trim().length < 2)) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast(isAr
        ? (isNew ? "أُنشئ التدفق في هذه المعاينة." : "حُفظت تغييرات التدفق.")
        : (isNew ? "Flow created in this preview." : "Flow changes saved."));
    }, 800);
  }

  return (
    <PageShell>
      <PageHeader
        title={isNew ? t.newFlowTitle : name || definition.summary.name[locale]}
        description={isNew ? t.newFlowDesc : t.editFlowDesc}
        actions={
          <>
            <Link href={`/${locale}/app/flows`} className="mj-btn mj-btn--ghost">
              <Back size={15} />{t.backToFlows}
            </Link>
            <Button variant="primary" loading={saving} onClick={submit}>
              {isNew ? t.createFlow : t.saveFlow}
            </Button>
          </>
        }
      />

      {!isNew ? (
        <p className="mj-caption" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="mj-mono" dir="ltr">v{definition.summary.version}</span>
          <span dir="ltr">{definition.summary.id}</span>
          <Badge tone={status === "published" ? "success" : status === "draft" ? "neutral" : "outline"}>{t.status[status]}</Badge>
        </p>
      ) : null}

      <div className="mj-cols mj-cols--split">
        {/* canvas — the node chain (the thread) */}
        <section style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <SectionHead title={t.canvasTitle} action={<Badge tone="outline"><span className="mj-mono">{nodes.length}</span> {t.nodesWord}</Badge>} />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(Object.keys(NODE_META) as FlowNode["type"][]).map((type) => {
              const meta = NODE_META[type];
              const Icon = meta.icon;
              return (
                <Button key={type} variant="secondary" size="sm" onClick={() => addNode(type)}>
                  <Icon size={13} />{isAr ? meta.labelAr : meta.labelEn}
                </Button>
              );
            })}
          </div>

          {nodes.length === 0 ? (
            <EmptyState icon={<Workflow size={20} />} title={t.emptyCanvasTitle} body={t.emptyCanvasBody} />
          ) : (
            <div className="mj-tl">
              {nodes.map((node) => {
                const meta = NODE_META[node.type];
                const Icon = meta.icon;
                return (
                  <div key={node.id} className="mj-tl__item">
                    <span
                      className="mj-tl__mark"
                      data-tone={node.type === "approval" ? "warning" : undefined}
                      aria-hidden
                    >
                      <Icon size={16} />
                    </span>
                    <div className="mj-tl__body">
                      <button
                        type="button"
                        className="mj-node"
                        aria-current={selectedId === node.id ? "true" : undefined}
                        onClick={() => { setSelectedId(node.id); setTouchedNode(false); }}
                      >
                        <span className="mj-node__id">
                          <span className="mj-label" style={{ color: "var(--ink)" }}>{node.label[locale]}</span>
                          <span className="mj-node__type">
                            <Icon size={12} />{nodeTypeName(node.type, isAr)}
                          </span>
                        </span>
                        <Badge tone={node.type === "approval" ? "warning" : "neutral"}>{nodeTypeName(node.type, isAr)}</Badge>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mj-caption">{t.canvasHint}</p>
        </section>

        {/* settings panel */}
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <Card>
            <div className="mj-card__header"><span className="mj-card__title">{t.flowSettings}</span></div>
            <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
              <Field label={t.nameField} htmlFor="flw-name" error={nameError} hint={t.nameHint}>
                <Input
                  id="flw-name"
                  value={name}
                  dir="auto"
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouchedName(true)}
                  aria-invalid={nameError ? true : undefined}
                />
              </Field>
              <Field label={t.descField} htmlFor="flw-desc" hint={t.descHint}>
                <Textarea
                  id="flw-desc"
                  value={description}
                  dir="auto"
                  style={{ minHeight: 72 }}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field label={t.statusField} htmlFor="flw-status">
                <Select id="flw-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                  <option value="draft">{t.status.draft}</option>
                  <option value="published">{t.status.published}</option>
                  <option value="archived">{t.status.archived}</option>
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <div className="mj-card__header">
              <span className="mj-card__title">{t.nodeSettings}</span>
              {selected ? <Badge tone="outline">{nodeTypeName(selected.type, isAr)}</Badge> : null}
            </div>
            <div className="mj-card__body" style={{ display: "grid", gap: 16 }}>
              {selected ? (
                <>
                  <Field label={t.nodeLabelField} htmlFor="flw-node-label" error={nodeError}>
                    <Input
                      id="flw-node-label"
                      value={selected.label[locale]}
                      dir="auto"
                      onChange={(e) => patchSelected({ label: { ...selected.label, [locale]: e.target.value } })}
                      onBlur={() => setTouchedNode(true)}
                      aria-invalid={nodeError ? true : undefined}
                    />
                  </Field>
                  <Field label={t.nodeDescField} htmlFor="flw-node-desc" hint={t.nodeDescHint}>
                    <Textarea
                      id="flw-node-desc"
                      value={selected.description[locale]}
                      dir="auto"
                      style={{ minHeight: 72 }}
                      onChange={(e) => patchSelected({ description: { ...selected.description, [locale]: e.target.value } })}
                    />
                  </Field>
                  <Button variant="ghost" onClick={removeSelected} style={{ justifySelf: "start", color: "var(--danger)" }}>
                    <Trash2 size={14} />{t.removeNode}
                  </Button>
                </>
              ) : (
                <p className="mj-caption">{t.noSelection}</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="mj-card__header"><span className="mj-card__title">{t.validationTitle}</span></div>
            <div className="mj-card__body" style={{ display: "grid", gap: 10 }}>
              <p className="mj-caption" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {definition.validation.errors === 0 ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <CircleCheck size={13} style={{ color: "var(--success)" }} />
                    <span><span className="mj-mono">0</span> {t.errorsWord}</span>
                  </span>
                ) : (
                  <Badge tone="danger"><span className="mj-mono">{definition.validation.errors}</span> {t.errorsWord}</Badge>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <CircleAlert size={13} style={{ color: "var(--warning)" }} />
                  <span><span className="mj-mono">{definition.validation.warnings}</span> {t.warningsWord}</span>
                </span>
              </p>
              <p className="mj-caption">{t.validationHint}</p>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------
   Node type metadata — icon + bilingual label (single source)
   ------------------------------------------------------------------ */

const NODE_META: Record<FlowNode["type"], { icon: LucideIcon; labelAr: string; labelEn: string }> = {
  input: { icon: LogIn, labelAr: "مُدخل", labelEn: "Input" },
  agent: { icon: Bot, labelAr: "وكيل", labelEn: "Agent" },
  transform: { icon: Shuffle, labelAr: "تحويل", labelEn: "Transform" },
  approval: { icon: UserCheck, labelAr: "موافقة", labelEn: "Approval" },
  output: { icon: Send, labelAr: "مُخرج", labelEn: "Output" },
};

function nodeTypeName(type: FlowNode["type"], isAr: boolean) {
  return isAr ? NODE_META[type].labelAr : NODE_META[type].labelEn;
}

/* ------------------------------------------------------------------
   Labels
   ------------------------------------------------------------------ */

function flowLabels(isAr: boolean) {
  return isAr ? {
    pageDesc: "حوّل العمل المتكرر إلى مسار واضح يمكن للفريق اختباره وتكراره.",
    newFlow: "تدفق جديد",
    search: "ابحث في التدفقات…",
    searchAria: "البحث في التدفقات",
    filterAria: "تصفية التدفقات",
    filterAll: "الكل",
    filterPublished: "منشور",
    filterDraft: "مسودة",
    nodesWord: "عقدة",
    runsWord: "تشغيل",
    listHint: "عقدة الموافقة توقف المسار قبل أي أثر خارجي.",
    statFlows: "التدفقات",
    statActive: "تشغيلات نشطة",
    statActiveHint: "تعمل الآن عبر تدفقاتك",
    statRuns: "إجمالي التشغيلات",
    emptyTitle: "لا تدفقات بعد",
    emptyBody: "ابدأ من تشغيل ناجح وحوّله إلى مسار قابل للتكرار.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو اعرض كل التدفقات.",
    clearFilters: "مسح عوامل التصفية",
    errorTitle: "تعذر تحميل التدفقات",
    errorBody: "حدث خلل مؤقت أثناء جلب التدفقات. بياناتك المحفوظة لم تتأثر.",
    retry: "إعادة المحاولة",
    newFlowTitle: "تدفق جديد",
    newFlowDesc: "اربط العقد لتكوين مسار قابل للتدقيق، ثم اختبره قبل النشر.",
    editFlowDesc: "عدّل المسار والإعدادات؛ الإصدار التالي يُسجَّل عند الحفظ.",
    backToFlows: "العودة إلى التدفقات",
    createFlow: "إنشاء التدفق",
    saveFlow: "حفظ التغييرات",
    canvasTitle: "مسار التدفق",
    canvasHint: "تسير التشغيلات من الأعلى إلى الأسفل؛ اضغط عقدة لتحرير إعداداتها.",
    emptyCanvasTitle: "المسار فارغ",
    emptyCanvasBody: "أضف عقدة من الأزرار أعلاه لتبدأ المسار.",
    flowSettings: "إعدادات التدفق",
    nameField: "اسم التدفق",
    nameHint: "اسم يصف النتيجة التي يكررها الفريق.",
    descField: "وصف التدفق",
    descHint: "سطر يوضح مدخلات المسار ومخرجاته.",
    statusField: "الحالة",
    nodeSettings: "العقدة المحددة",
    nodeLabelField: "تسمية العقدة",
    nodeDescField: "وصف العقدة",
    nodeDescHint: "ما تفعله هذه العقدة داخل المسار.",
    removeNode: "احذف العقدة",
    noSelection: "اختر عقدة من المسار لتحريرها.",
    validationTitle: "التحقق",
    errorsWord: "أخطاء",
    warningsWord: "تنبيهات",
    validationHint: "تُتحقق بنية المسار عند الحفظ وقبل أول تشغيل.",
    errName: "الاسم مطلوب — حرفان على الأقل.",
    errNode: "تسمية العقدة مطلوبة — حرفان على الأقل.",
    status: { draft: "مسودة", published: "منشور", archived: "مؤرشف" } as Record<string, string>,
    ago: { now: "الآن", min: "د", hour: "س", day: "يوم" },
  } : {
    pageDesc: "Turn repeatable work into a path your team can test and repeat.",
    newFlow: "New flow",
    search: "Search flows…",
    searchAria: "Search flows",
    filterAria: "Filter flows",
    filterAll: "All",
    filterPublished: "Published",
    filterDraft: "Draft",
    nodesWord: "nodes",
    runsWord: "runs",
    listHint: "The approval node pauses the path before any external effect.",
    statFlows: "Flows",
    statActive: "Active runs",
    statActiveHint: "Running across your flows now",
    statRuns: "Total runs",
    emptyTitle: "No flows yet",
    emptyBody: "Start from a successful run and turn it into a repeatable path.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another word or show all flows.",
    clearFilters: "Clear filters",
    errorTitle: "Couldn’t load flows",
    errorBody: "A temporary issue interrupted the fetch. Your saved data is unaffected.",
    retry: "Try again",
    newFlowTitle: "New flow",
    newFlowDesc: "Connect nodes into an auditable path, then test it before publishing.",
    editFlowDesc: "Adjust the path and settings; the next version is recorded on save.",
    backToFlows: "Back to flows",
    createFlow: "Create flow",
    saveFlow: "Save changes",
    canvasTitle: "Flow path",
    canvasHint: "Runs flow top to bottom; select a node to edit its settings.",
    emptyCanvasTitle: "The path is empty",
    emptyCanvasBody: "Add a node from the buttons above to start the path.",
    flowSettings: "Flow settings",
    nameField: "Flow name",
    nameHint: "Name the outcome your team repeats.",
    descField: "Flow description",
    descHint: "One line on the path’s inputs and outputs.",
    statusField: "Status",
    nodeSettings: "Selected node",
    nodeLabelField: "Node label",
    nodeDescField: "Node description",
    nodeDescHint: "What this node does inside the path.",
    removeNode: "Delete node",
    noSelection: "Select a node from the path to edit it.",
    validationTitle: "Validation",
    errorsWord: "errors",
    warningsWord: "warnings",
    validationHint: "The path structure is validated on save and before the first run.",
    errName: "Name is required — at least 2 characters.",
    errNode: "Node label is required — at least 2 characters.",
    status: { draft: "Draft", published: "Published", archived: "Archived" } as Record<string, string>,
    ago: { now: "now", min: "m", hour: "h", day: "d" },
  };
}

"use client";

/* ============================================================
   MDS v4 — Projects («المشاريع»)
   List: cards grid (name, description, activeRuns, conversations)
   Detail: context page — info + agents + flows + runs.
   Full state coverage: populated / empty / error(retry) / loading.
   ============================================================ */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Bot, FolderKanban, MessageCircle, Plus, Workflow, Zap,
} from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type {
  AgentSummary, FlowSummary, ProjectSummary, RunSummary,
} from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { SurfaceStateOverride } from "@/lib/surface-states";
import {
  Badge, Button, Dialog, EmptyState, ErrorState, Field, Input, SearchInput,
  Segmented, SkeletonList, Textarea, ToastProvider, useToast,
} from "./primitives";
import {
  ListRow, MoneyView, PageHeader, PageShell, SectionHead, StatTile, TimeAgo, Toolbar, ViewAll,
} from "./page-kit";
import { RunStatusBadge } from "./data";
import "../../app/styles/mj/pages-ops.css";

/* ------------------------------------------------------------------
   Projects list
   ------------------------------------------------------------------ */

export function MjProjects(props: {
  locale: Locale; dictionary: Dictionary; projects: ProjectSummary[]; scenario: SurfaceStateOverride;
}) {
  /* ToastProvider lives here so the create-project dialog can confirm */
  return (
    <ToastProvider>
      <ProjectsInner {...props} />
    </ToastProvider>
  );
}

function ProjectsInner({
  locale, dictionary, projects, scenario,
}: {
  locale: Locale; dictionary: Dictionary; projects: ProjectSummary[]; scenario: SurfaceStateOverride;
}) {
  const t = projectLabels(locale === "ar");
  const [surface, setSurface] = useState<SurfaceStateOverride>(scenario);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? projects.filter((p) =>
          p.name[locale].toLowerCase().includes(q) ||
          p.description[locale].toLowerCase().includes(q))
      : [...projects];
    list.sort((a, b) =>
      sort === "name"
        ? a.name[locale].localeCompare(b.name[locale], locale)
        : b.updatedAt.localeCompare(a.updatedAt));
    return list;
  }, [projects, query, sort, locale]);

  const activeRuns = projects.reduce((sum, p) => sum + p.activeRuns, 0);
  const conversations = projects.reduce((sum, p) => sum + p.conversations, 0);
  const searching = query.trim().length > 0;

  return (
    <PageShell>
      <PageHeader
        title={dictionary.nav.projects}
        description={t.pageDesc}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} />{t.newProject}
          </Button>
        }
      />

      {surface === "loading" ? (
        <SkeletonList rows={6} />
      ) : surface === "error" ? (
        <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => setSurface(null)} retryLabel={t.retry} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={20} />}
          title={t.emptyTitle}
          body={t.emptyBody}
          action={<Button variant="primary" onClick={() => setCreating(true)}><Plus size={15} />{t.newProject}</Button>}
        />
      ) : (
        <>
          <div className="mj-grid mj-grid--cards">
            <StatTile label={t.statProjects} value={String(projects.length)} icon={<FolderKanban size={14} />} />
            <StatTile label={t.statActive} value={String(activeRuns)} icon={<Zap size={14} />} meta={t.statActiveHint} />
            <StatTile label={t.statConversations} value={String(conversations)} icon={<MessageCircle size={14} />} />
          </div>

          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchAria} />
            <Segmented
              ariaLabel={t.sortAria}
              value={sort}
              onChange={(v) => setSort(v as "recent" | "name")}
              options={[{ id: "recent", label: t.sortRecent }, { id: "name", label: t.sortName }]}
            />
          </Toolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<FolderKanban size={20} />}
              title={t.noMatchTitle}
              body={t.noMatchBody}
              action={<Button variant="secondary" onClick={() => setQuery("")}>{t.clearSearch}</Button>}
            />
          ) : (
            <div className="mj-grid mj-grid--cards">
              {filtered.map((p) => (
                <ProjectCard key={p.id} locale={locale} project={p} labels={t} dictionary={dictionary} />
              ))}
            </div>
          )}
        </>
      )}

      <NewProjectDialog
        open={creating}
        onClose={() => setCreating(false)}
        labels={t}
        locale={locale}
      />
    </PageShell>
  );
}

function ProjectCard({
  project, locale, labels,
}: {
  project: ProjectSummary; locale: Locale; labels: ProjectLabels;
}) {
  return (
    <Link
      href={`/${locale}/app/projects/${project.id}`}
      className="mj-card mj-card--link"
      style={{ padding: 20, display: "grid", gap: 10, alignContent: "start", minWidth: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <strong className="mj-title-m mj-clamp-2 mj-grow">{project.name[locale]}</strong>
        {project.activeRuns > 0 ? (
          <Badge tone="accent"><Zap size={11} /><span className="mj-mono">{project.activeRuns}</span></Badge>
        ) : null}
      </div>
      <p className="mj-body-s mj-ink-2 mj-clamp-2">{project.description[locale]}</p>
      <p className="mj-caption" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <MessageCircle size={12} />
          <span className="mj-mono">{project.conversations}</span> {labels.conversations}
        </span>
        <TimeAgo iso={project.updatedAt} locale={locale} labels={labels.ago} />
      </p>
    </Link>
  );
}

/* new-project dialog — validate on blur, errors clear on fix */
function NewProjectDialog({
  open, onClose, labels, locale,
}: {
  open: boolean; onClose: () => void; labels: ProjectLabels; locale: Locale;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState<{ name: boolean; description: boolean }>({ name: false, description: false });
  const [saving, setSaving] = useState(false);

  const nameError = touched.name && name.trim().length < 2 ? labels.errName : undefined;
  const descError = touched.description && description.trim().length < 6 ? labels.errDesc : undefined;

  function submit() {
    setTouched({ name: true, description: true });
    if (name.trim().length < 2 || description.trim().length < 6) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onClose();
      setName("");
      setDescription("");
      setTouched({ name: false, description: false });
      toast(locale === "ar" ? "أُنشئ المشروع في هذه المعاينة." : "Project created in this preview.");
    }, 700);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={labels.newProject}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{labels.cancel}</Button>
          <Button variant="primary" loading={saving} onClick={submit}>{labels.createProject}</Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        <Field label={labels.nameField} htmlFor="prj-name" error={nameError} hint={labels.nameHint}>
          <Input
            id="prj-name"
            value={name}
            dir="auto"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            aria-invalid={nameError ? true : undefined}
          />
        </Field>
        <Field label={labels.descField} htmlFor="prj-desc" error={descError} hint={labels.descHint}>
          <Textarea
            id="prj-desc"
            value={description}
            dir="auto"
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
            aria-invalid={descError ? true : undefined}
          />
        </Field>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------
   Project detail — context page
   ------------------------------------------------------------------ */

export function MjProjectDetail({
  locale, dictionary, project, agents, flows, runs, scenario,
}: {
  locale: Locale;
  dictionary: Dictionary;
  project: ProjectSummary | null;
  agents: AgentSummary[];
  flows: FlowSummary[];
  runs: RunSummary[];
  scenario: SurfaceStateOverride;
}) {
  const t = projectLabels(locale === "ar");
  const [surface, setSurface] = useState<SurfaceStateOverride>(scenario);
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;

  if (!project) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.projects} description={t.pageDesc} />
        <EmptyState
          icon={<FolderKanban size={20} />}
          title={t.missingTitle}
          body={t.missingBody}
          action={
            <Link href={`/${locale}/app/projects`} className="mj-btn mj-btn--secondary">
              <Back size={15} />{t.backToProjects}
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={project.name[locale]}
        description={project.description[locale]}
        actions={
          <Link href={`/${locale}/app/projects`} className="mj-btn mj-btn--ghost">
            <Back size={15} />{dictionary.nav.projects}
          </Link>
        }
      />

      {surface === "loading" ? (
        <SkeletonList rows={5} />
      ) : surface === "error" ? (
        <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => setSurface(null)} retryLabel={t.retry} />
      ) : (
        <>
          <div className="mj-grid mj-grid--cards">
            <StatTile label={t.statActive} value={String(project.activeRuns)} icon={<Zap size={14} />} />
            <StatTile label={t.statConversations} value={String(project.conversations)} icon={<MessageCircle size={14} />} />
            <StatTile label={t.agentsSectionShort} value={String(agents.length)} icon={<Bot size={14} />} />
            <StatTile label={t.flowsSectionShort} value={String(flows.length)} icon={<Workflow size={14} />} />
          </div>

          <section style={{ display: "grid", gap: 12 }}>
            <SectionHead title={t.agentsSection} action={<ViewAll href={`/${locale}/app/agents`} label={dictionary.common.viewAll} />} />
            {agents.length === 0 ? (
              <EmptyState icon={<Bot size={20} />} title={t.noAgentsTitle} body={t.noAgentsBody} />
            ) : (
              <div className="mj-list">
                {agents.map((a) => (
                  <ListRow
                    key={a.id}
                    href={`/${locale}/app/agents/${a.id}/edit`}
                    leading={<span className="mj-avatar"><Bot size={17} /></span>}
                    title={a.name[locale]}
                    desc={a.description[locale]}
                    trailing={<Badge tone={a.status === "published" ? "success" : "neutral"}>{t.status[a.status]}</Badge>}
                  />
                ))}
              </div>
            )}
          </section>

          <section style={{ display: "grid", gap: 12 }}>
            <SectionHead title={t.flowsSection} action={<ViewAll href={`/${locale}/app/flows`} label={dictionary.common.viewAll} />} />
            {flows.length === 0 ? (
              <EmptyState icon={<Workflow size={20} />} title={t.noFlowsTitle} body={t.noFlowsBody} />
            ) : (
              <div className="mj-list">
                {flows.map((f) => (
                  <ListRow
                    key={f.id}
                    href={`/${locale}/app/flows/${f.id}/edit`}
                    leading={<span className="mj-avatar"><Workflow size={17} /></span>}
                    title={f.name[locale]}
                    desc={f.description[locale]}
                    trailing={
                      <>
                        {f.activeRuns > 0 ? (
                          <Badge tone="accent"><Zap size={11} /><span className="mj-mono">{f.activeRuns}</span></Badge>
                        ) : null}
                        <Badge tone={f.status === "published" ? "success" : "neutral"}>{t.status[f.status]}</Badge>
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section style={{ display: "grid", gap: 12 }}>
            <SectionHead title={t.runsSection} action={<ViewAll href={`/${locale}/app/runs`} label={dictionary.common.viewAll} />} />
            {runs.length === 0 ? (
              <EmptyState icon={<Zap size={20} />} title={t.noRunsTitle} body={t.noRunsBody} />
            ) : (
              <div className="mj-list">
                {runs.map((r) => (
                  <ListRow
                    key={r.id}
                    href={`/${locale}/app/runs/${r.id}`}
                    leading={<span className="mj-avatar">{r.kind === "agent" ? <Bot size={17} /> : <Workflow size={17} />}</span>}
                    title={r.title[locale]}
                    desc={<RunStatusBadge status={r.status} label={dictionary.status[r.status]} />}
                    trailing={<MoneyView amountMinor={r.cost.amountMinor} currency={r.cost.currency} locale={locale} />}
                  />
                ))}
              </div>
            )}
            <p className="mj-caption">
              {t.updated} <TimeAgo iso={project.updatedAt} locale={locale} labels={t.ago} />
            </p>
          </section>
        </>
      )}
    </PageShell>
  );
}

/* ------------------------------------------------------------------
   Labels
   ------------------------------------------------------------------ */

type ProjectLabels = ReturnType<typeof projectLabels>;

function projectLabels(isAr: boolean) {
  return isAr ? {
    pageDesc: "السياق الذي يجمع المحادثات والوكلاء والتدفقات لكل هدف.",
    newProject: "مشروع جديد",
    search: "ابحث في المشاريع…",
    searchAria: "البحث في المشاريع",
    sortAria: "ترتيب المشاريع",
    sortRecent: "الأحدث",
    sortName: "الاسم",
    conversations: "محادثة",
    statProjects: "المشاريع",
    statActive: "تشغيلات نشطة",
    statActiveHint: "تعمل الآن عبر مشاريعك",
    statConversations: "محادثات",
    updatedAt: "آخر تحديث",
    updated: "آخر تحديث للمشروع:",
    agentsSectionShort: "وكلاء المشروع",
    flowsSectionShort: "تدفقات المشروع",
    emptyTitle: "لا مشاريع بعد",
    emptyBody: "أنشئ مشروعًا ليجمع محادثاتك ووكلاءك وتدفقاتك في سياق واحد.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب كلمة أخرى أو امسح البحث لعرض كل المشاريع.",
    clearSearch: "امسح البحث",
    errorTitle: "تعذر تحميل المشاريع",
    errorBody: "حدث خلل مؤقت أثناء جلب المشاريع. بياناتك المحفوظة لم تتأثر.",
    retry: "إعادة المحاولة",
    nameField: "اسم المشروع",
    nameHint: "اسم يصف الهدف لا التقنية.",
    descField: "وصف المشروع",
    descHint: "سطر أو سطران يوضحان نطاق المشروع.",
    errName: "الاسم مطلوب — حرفان على الأقل.",
    errDesc: "الوصف مطلوب — ستة أحرف على الأقل.",
    cancel: "إلغاء",
    createProject: "إنشاء المشروع",
    missingTitle: "هذا المشروع غير موجود",
    missingBody: "قد يكون الرابط قديمًا أو أُرشف المشروع. اختر مشروعًا من القائمة.",
    backToProjects: "العودة إلى المشاريع",
    agentsSection: "الوكلاء في هذا المشروع",
    noAgentsTitle: "لا وكلاء بعد",
    noAgentsBody: "عرّف وكيلًا يخدم هدف هذا المشروع مباشرة.",
    flowsSection: "تدفقات المشروع",
    noFlowsTitle: "لا تدفقات بعد",
    noFlowsBody: "حوّل عملًا متكررًا في هذا المشروع إلى تدفق قابل للاختبار.",
    runsSection: "تشغيلات المشروع",
    noRunsTitle: "لا تشغيلات بعد",
    noRunsBody: "ابدأ محادثة أو شغّل وكيلًا لترى التشغيلات هنا.",
    status: { draft: "مسودة", published: "منشور", archived: "مؤرشف" } as Record<string, string>,
    ago: { now: "الآن", min: "د", hour: "س", day: "يوم" },
  } : {
    pageDesc: "The shared context for conversations, agents, and flows behind each goal.",
    newProject: "New project",
    search: "Search projects…",
    searchAria: "Search projects",
    sortAria: "Sort projects",
    sortRecent: "Recent",
    sortName: "Name",
    conversations: "conversations",
    statProjects: "Projects",
    statActive: "Active runs",
    statActiveHint: "Running across your projects now",
    statConversations: "Conversations",
    updatedAt: "Last update",
    updated: "Project last updated:",
    agentsSectionShort: "Project agents",
    flowsSectionShort: "Project flows",
    emptyTitle: "No projects yet",
    emptyBody: "Create a project to gather conversations, agents, and flows in one context.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another word or clear the search to see every project.",
    clearSearch: "Clear search",
    errorTitle: "Couldn’t load projects",
    errorBody: "A temporary issue interrupted the fetch. Your saved data is unaffected.",
    retry: "Try again",
    nameField: "Project name",
    nameHint: "Name the goal, not the technology.",
    descField: "Project description",
    descHint: "One or two lines on the project scope.",
    errName: "Name is required — at least 2 characters.",
    errDesc: "Description is required — at least 6 characters.",
    cancel: "Cancel",
    createProject: "Create project",
    missingTitle: "This project doesn’t exist",
    missingBody: "The link may be outdated, or the project was archived. Pick one from the list.",
    backToProjects: "Back to projects",
    agentsSection: "Agents in this project",
    noAgentsTitle: "No agents yet",
    noAgentsBody: "Define an agent that serves this project’s goal directly.",
    flowsSection: "Project flows",
    noFlowsTitle: "No flows yet",
    noFlowsBody: "Turn repeatable work in this project into a testable flow.",
    runsSection: "Project runs",
    noRunsTitle: "No runs yet",
    noRunsBody: "Start a chat or run an agent to see runs here.",
    status: { draft: "Draft", published: "Published", archived: "Archived" } as Record<string, string>,
    ago: { now: "now", min: "m", hour: "h", day: "d" },
  };
}

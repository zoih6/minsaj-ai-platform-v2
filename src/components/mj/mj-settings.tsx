"use client";

/* ============================================================
   MDS v4 — Settings («الإعدادات»)
   Three underline tabs — profile / appearance / workspace.
   Real fields with on-blur validation (errors clear on fix),
   loading submits confirmed by toasts. Appearance uses
   next-themes (hydration-safe) and locale switch by route.
   ============================================================ */

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Building2, Palette, User } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import { switchLocaleInPath } from "@minsaj/i18n";
import type { LocalizedText, TeamMember } from "@minsaj/contracts";
import {
  Button, ErrorState, Field, Input, Select, SkeletonList, Switch, Tabs, Textarea,
  ToastProvider, useToast,
} from "./primitives";
import { PageHeader, PageShell } from "./page-kit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type ApprovalPolicy = "always_external" | "workspace_policy" | "manual_only";

export function MjSettings({
  locale, dictionary, member, workspaceName, error,
}: {
  locale: Locale; dictionary: Dictionary;
  member: TeamMember | null; workspaceName: LocalizedText | null; error?: boolean;
}) {
  return (
    <ToastProvider>
      <SettingsPage locale={locale} dictionary={dictionary} member={member} workspaceName={workspaceName} error={error} />
    </ToastProvider>
  );
}

function SettingsPage({
  locale, dictionary, member, workspaceName, error,
}: {
  locale: Locale; dictionary: Dictionary; member: TeamMember | null;
  workspaceName: LocalizedText | null; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = settingsLabels(isAr);
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [tab, setTab] = useState<"profile" | "appearance" | "workspace">("profile");

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  if (error || !member || !workspaceName) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.settings} description={t.desc} />
        {retrying ? <SkeletonList rows={4} /> : (
          <ErrorState
            title={t.errTitle}
            body={t.errBody}
            retryLabel={t.retry}
            onRetry={() => { setRetrying(true); router.refresh(); }}
          />
        )}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader title={dictionary.nav.settings} description={t.desc} />

      <Tabs
        ariaLabel={t.tabsA11y}
        value={tab}
        onChange={(id) => setTab(id as "profile" | "appearance" | "workspace")}
        tabs={[
          { id: "profile", label: t.tabProfile, icon: <User size={15} /> },
          { id: "appearance", label: t.tabAppearance, icon: <Palette size={15} /> },
          { id: "workspace", label: t.tabWorkspace, icon: <Building2 size={15} /> },
        ]}
      />

      {tab === "profile" ? <ProfileTab locale={locale} member={member} labels={t} /> : null}
      {tab === "appearance" ? <AppearanceTab locale={locale} labels={t} /> : null}
      {tab === "workspace" ? <WorkspaceTab locale={locale} workspaceName={workspaceName} labels={t} /> : null}
    </PageShell>
  );
}

/* ---------------- profile ---------------- */

function ProfileTab({ locale, member, labels: t }: { locale: Locale; member: TeamMember; labels: SettingsLabels }) {
  const toast = useToast();
  const [name, setName] = useState(member.name[locale]);
  const [nameTouched, setNameTouched] = useState(false);
  const [email, setEmail] = useState(member.email);
  const [emailTouched, setEmailTouched] = useState(false);
  const [bio, setBio] = useState("");
  const [bioTouched, setBioTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameError = name.trim().length < 2 ? t.nameRequired : undefined;
  const emailError = EMAIL_RE.test(email.trim()) ? undefined : t.emailInvalid;
  const bioError = bio.length > 280 ? t.bioTooLong : undefined;
  const formValid = !nameError && !emailError && !bioError;

  function save() {
    if (!formValid || saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast(t.savedProfile);
    }, 800);
  }

  return (
    <section style={{ display: "grid", gap: 16, maxInlineSize: 560 }}>
      <div className="mj-card mj-card--pad" style={{ display: "grid", gap: 16 }}>
        <Field label={t.nameLabel} htmlFor="st-name" error={nameTouched ? nameError : undefined}>
          <Input
            id="st-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            aria-invalid={nameTouched && nameError ? true : undefined}
          />
        </Field>
        <Field label={t.emailLabel} htmlFor="st-email" hint={t.emailHint} error={emailTouched ? emailError : undefined}>
          <Input
            id="st-email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={emailTouched && emailError ? true : undefined}
          />
        </Field>
        <Field label={t.bioLabel} htmlFor="st-bio" hint={t.bioHint} error={bioTouched ? bioError : undefined}>
          <Textarea
            id="st-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onBlur={() => setBioTouched(true)}
            placeholder={t.bioPlaceholder}
          />
        </Field>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="mj-badge mj-badge--outline">{t.roleLabels[member.role]}</span>
          <span className="mj-caption">{t.roleNote}</span>
        </div>
        <div>
          <Button variant="primary" size="sm" loading={saving} disabled={!formValid} onClick={save}>
            {t.saveProfile}
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- appearance ---------------- */

function AppearanceTab({ locale, labels: t }: { locale: Locale; labels: SettingsLabels }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const currentTheme = mounted && (theme === "dark" || theme === "light") ? theme : "system";

  return (
    <section style={{ display: "grid", gap: 16, maxInlineSize: 560 }}>
      <div className="mj-card mj-card--pad" style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <span className="mj-label" style={{ color: "var(--ink-2)" }} id="st-theme-label">{t.themeLabel}</span>
          <div role="group" aria-labelledby="st-theme-label" className="mj-seg">
            {([
              { id: "dark", label: t.themeDark },
              { id: "light", label: t.themeLight },
              { id: "system", label: t.themeSystem },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={currentTheme === opt.id}
                className="mj-seg__btn"
                onClick={() => setTheme(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mj-caption">{t.themeHint}</p>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <span className="mj-label" style={{ color: "var(--ink-2)" }} id="st-lang-label">{t.languageLabel}</span>
          <div role="group" aria-labelledby="st-lang-label" className="mj-seg">
            <button type="button" aria-pressed={locale === "ar"} className="mj-seg__btn" onClick={() => router.push(switchLocaleInPath(pathname, "ar"))}>
              {t.langAr}
            </button>
            <button type="button" aria-pressed={locale === "en"} className="mj-seg__btn" onClick={() => router.push(switchLocaleInPath(pathname, "en"))}>
              {t.langEn}
            </button>
          </div>
          <p className="mj-caption">{t.languageHint}</p>
        </div>

        <div className="mj-well" style={{ display: "grid", gap: 6 }}>
          <p className="mj-body-s" style={{ color: "var(--ink-2)" }}>{t.rtlTitle}</p>
          <p className="mj-caption">{t.rtlHint}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- workspace ---------------- */

function WorkspaceTab({ locale, workspaceName, labels: t }: { locale: Locale; workspaceName: LocalizedText; labels: SettingsLabels }) {
  const toast = useToast();
  const [name, setName] = useState(workspaceName[locale]);
  const [nameTouched, setNameTouched] = useState(false);
  const [policy, setPolicy] = useState<ApprovalPolicy>("always_external");
  const [budget, setBudget] = useState("");
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [autoArchive, setAutoArchive] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameError = name.trim().length < 2 ? t.nameRequired : undefined;
  const budgetError = budget.trim() === "" || (Number(budget) > 0 && Number.isFinite(Number(budget)))
    ? undefined
    : t.budgetInvalid;
  const formValid = !nameError && !budgetError;

  function save() {
    if (!formValid || saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast(t.savedWorkspace);
    }, 800);
  }

  return (
    <section style={{ display: "grid", gap: 16, maxInlineSize: 560 }}>
      <div className="mj-card mj-card--pad" style={{ display: "grid", gap: 16 }}>
        <Field label={t.wsNameLabel} htmlFor="st-ws-name" error={nameTouched ? nameError : undefined}>
          <Input
            id="st-ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            aria-invalid={nameTouched && nameError ? true : undefined}
          />
        </Field>
        <Field label={t.policyLabel} htmlFor="st-policy" hint={t.policyHint}>
          <Select id="st-policy" value={policy} onChange={(e) => setPolicy(e.target.value as ApprovalPolicy)}>
            <option value="always_external">{t.policyLabels.always_external}</option>
            <option value="workspace_policy">{t.policyLabels.workspace_policy}</option>
            <option value="manual_only">{t.policyLabels.manual_only}</option>
          </Select>
        </Field>
        <Field label={t.budgetLabel} htmlFor="st-budget" hint={t.budgetHint} error={budgetTouched ? budgetError : undefined}>
          <Input
            id="st-budget"
            inputMode="decimal"
            dir="ltr"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            onBlur={() => setBudgetTouched(true)}
            placeholder="0.00"
            aria-invalid={budgetTouched && budgetError ? true : undefined}
          />
        </Field>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Switch checked={autoArchive} onCheckedChange={setAutoArchive} label={t.autoArchiveLabel} />
          <span style={{ display: "grid", gap: 2 }}>
            <span className="mj-label">{t.autoArchiveLabel}</span>
            <span className="mj-caption">{t.autoArchiveHint}</span>
          </span>
        </div>
        <div>
          <Button variant="primary" size="sm" loading={saving} disabled={!formValid} onClick={save}>
            {t.saveWorkspace}
          </Button>
        </div>
      </div>
    </section>
  );
}

type SettingsLabels = ReturnType<typeof settingsLabels>;

function settingsLabels(isAr: boolean) {
  return isAr ? {
    desc: "ملفك ومظهر مساحة العمل وسياساتها — كل شيء قابل للمراجعة قبل الحفظ.",
    tabsA11y: "أقسام الإعدادات",
    tabProfile: "الملف الشخصي", tabAppearance: "المظهر", tabWorkspace: "مساحة العمل",
    nameLabel: "الاسم", nameRequired: "الاسم مطلوب (حرفان على الأقل).",
    emailLabel: "البريد الإلكتروني", emailHint: "يُستخدم لتسجيل الدخول ودعوات الفريق.", emailInvalid: "اكتب بريدًا صالحًا مثل name@team.com.",
    bioLabel: "نبذة", bioHint: "اختيارية — تظهر لزملائك في الفريق.", bioPlaceholder: "ماذا تعمل عليه؟",
    bioTooLong: "النبذة أطول من ٢٨٠ حرفًا.",
    roleLabels: { owner: "مالك", admin: "مشرف", builder: "بانٍ", reviewer: "مراجع", viewer: "مشاهد" },
    roleNote: "الأدوار تُدار من صفحة الفريق.",
    saveProfile: "حفظ الملف", savedProfile: "حُفظ الملف الشخصي.",
    themeLabel: "المظهر", themeDark: "داكن", themeLight: "فاتح", themeSystem: "حسب النظام",
    themeHint: "الوضع الداكن هو الافتراضي في منسج؛ وضع النظام يتبع جهازك.",
    languageLabel: "اللغة", langAr: "العربية", langEn: "English",
    languageHint: "تبديل اللغة ينقلك إلى المسار المقابل ويحفظ اتجاه الواجهة.",
    rtlTitle: "الاتجاه والحركة",
    rtlHint: "الواجهة العربية RTL أصلية بالخصائص المنطقية، وحركة الواجهة تحترم إعداد تقليل الحركة في نظامك.",
    wsNameLabel: "اسم مساحة العمل",
    policyLabel: "سياسة الموافقة الافتراضية", policyHint: "تُطبَّق على الوكلاء الجديدة ما لم تُضبط بغيرها.",
    policyLabels: { always_external: "كل أثر خارجي خلف موافقة", workspace_policy: "سياسة مساحة العمل العامة", manual_only: "تشغيل يدوي فقط" },
    budgetLabel: "حد الميزانية الشهرية (دولار)", budgetHint: "اختياري — عند تجاوزه تتوقف التشغيلات الجديدة للاستئذان.",
    budgetInvalid: "اكتب رقمًا موجبًا مثل 20 أو اتركه فارغًا.",
    autoArchiveLabel: "أرشفة تلقائية للتشغيلات المكتملة", autoArchiveHint: "تنقل المكتمل بعد ٣٠ يومًا إلى الأرشيف دون حذف.",
    saveWorkspace: "حفظ الإعدادات", savedWorkspace: "حُفظت إعدادات مساحة العمل.",
    errTitle: "تعذر تحميل الإعدادات",
    errBody: "حدث خطأ مؤقت أثناء جلب إعداداتك — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    desc: "Your profile, workspace appearance, and policies — everything reviewable before saving.",
    tabsA11y: "Settings sections",
    tabProfile: "Profile", tabAppearance: "Appearance", tabWorkspace: "Workspace",
    nameLabel: "Name", nameRequired: "A name is required (at least 2 characters).",
    emailLabel: "Email address", emailHint: "Used for sign-in and team invites.", emailInvalid: "Enter a valid email such as name@team.com.",
    bioLabel: "Bio", bioHint: "Optional — shown to your teammates.", bioPlaceholder: "What are you working on?",
    bioTooLong: "The bio is longer than 280 characters.",
    roleLabels: { owner: "Owner", admin: "Admin", builder: "Builder", reviewer: "Reviewer", viewer: "Viewer" },
    roleNote: "Roles are managed on the team page.",
    saveProfile: "Save profile", savedProfile: "Profile saved.",
    themeLabel: "Theme", themeDark: "Dark", themeLight: "Light", themeSystem: "System",
    themeHint: "Dark is Minsaj’s default; system mode follows your device.",
    languageLabel: "Language", langAr: "العربية", langEn: "English",
    languageHint: "Switching language moves you to the mirrored route and keeps the UI direction native.",
    rtlTitle: "Direction and motion",
    rtlHint: "The Arabic UI is natively RTL with logical properties, and motion respects your system’s reduced-motion setting.",
    wsNameLabel: "Workspace name",
    policyLabel: "Default approval policy", policyHint: "Applied to new agents unless overridden.",
    policyLabels: { always_external: "Every external effect behind approval", workspace_policy: "General workspace policy", manual_only: "Manual runs only" },
    budgetLabel: "Monthly budget cap (USD)", budgetHint: "Optional — when exceeded, new runs pause to ask.",
    budgetInvalid: "Enter a positive number such as 20, or leave it empty.",
    autoArchiveLabel: "Auto-archive completed runs", autoArchiveHint: "Moves completed runs to the archive after 30 days without deleting.",
    saveWorkspace: "Save settings", savedWorkspace: "Workspace settings saved.",
    errTitle: "Couldn’t load settings",
    errBody: "A temporary error occurred while fetching your settings — try again.",
    retry: "Try again",
  };
}

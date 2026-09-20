"use client";

/* ============================================================
   MDS v4 — Team («الفريق»)
   Members with avatar fallback, role + status badges, last
   active. Invite CTA opens a Dialog with on-blur validation
   (required + email format) and a loading submit confirmed
   by a toast. ToastProvider wraps the page region.
   ============================================================ */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, SearchX, UserPlus, Users } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import type { TeamMember } from "@minsaj/contracts";
import {
  Avatar, Button, Dialog, EmptyState, ErrorState, Field, Input, SearchInput, Select,
  SkeletonList, ToastProvider, useToast,
} from "./primitives";
import { ListRow, PageHeader, PageShell, TimeAgo, Toolbar } from "./page-kit";

type Role = TeamMember["role"];
type MemberStatus = TeamMember["status"];
type InviteRole = Exclude<Role, "owner">;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MjTeam({
  locale, dictionary, members, error,
}: {
  locale: Locale; dictionary: Dictionary; members: TeamMember[]; error?: boolean;
}) {
  return (
    <ToastProvider>
      <TeamPage locale={locale} dictionary={dictionary} members={members} error={error} />
    </ToastProvider>
  );
}

function TeamPage({
  locale, dictionary, members, error,
}: {
  locale: Locale; dictionary: Dictionary; members: TeamMember[]; error?: boolean;
}) {
  const isAr = locale === "ar";
  const t = teamLabels(isAr);
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => { if (!error) setRetrying(false); }, [error]);
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 3000);
    return () => clearTimeout(id);
  }, [retrying]);

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.name.ar.toLowerCase().includes(q) || m.name.en.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  if (error) {
    return (
      <PageShell>
        <PageHeader title={dictionary.nav.team} description={t.desc} />
        {retrying ? <SkeletonList rows={5} /> : (
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
      <PageHeader
        title={dictionary.nav.team}
        description={t.desc}
        actions={
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} />{t.invite}
          </Button>
        }
      />

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder={t.search} ariaLabel={t.searchA11y} />
      </Toolbar>

      {members.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title={t.emptyTitle} body={t.emptyBody} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} />}
          title={t.noMatchTitle}
          body={t.noMatchBody}
          action={
            <button type="button" className="mj-btn mj-btn--secondary mj-btn--sm" onClick={() => setQuery("")}>
              {t.clearSearch}
            </button>
          }
        />
      ) : (
        <div className="mj-list">
          {filtered.map((m) => (
            <ListRow
              key={m.id}
              leading={<Avatar fallback={m.initials} alt={m.name[locale]} />}
              title={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {m.name[locale]}
                  <RoleBadge role={m.role} labels={t.roleLabels} />
                </span>
              }
              desc={
                m.status === "pending" ? (
                  <span className="mj-caption" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Clock size={12} />{t.pendingNote}
                  </span>
                ) : (
                  <span className="mj-mono" dir="ltr" style={{ color: "var(--ink-3)" }}>{m.email}</span>
                )
              }
              trailing={
                <>
                  {m.lastActiveAt ? (
                    <TimeAgo iso={m.lastActiveAt} locale={locale} labels={t.ago} />
                  ) : null}
                  <StatusBadge status={m.status} labels={t.statusLabels} />
                </>
              }
            />
          ))}
        </div>
      )}

      <p className="mj-caption">{t.hint}</p>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        labels={t}
        onSent={() => toast(t.inviteSent)}
      />
    </PageShell>
  );
}

function RoleBadge({ role, labels }: { role: Role; labels: Record<Role, string> }) {
  return <span className={`mj-badge ${role === "owner" ? "mj-badge--outline" : "mj-badge--neutral"}`}>{labels[role]}</span>;
}

function StatusBadge({ status, labels }: { status: MemberStatus; labels: Record<MemberStatus, string> }) {
  const tone = status === "active" ? "success" : status === "pending" ? "warning" : "danger";
  return <span className={`mj-badge mj-badge--${tone}`}>{labels[status]}</span>;
}

function InviteDialog({
  open, onClose, labels, onSent,
}: {
  open: boolean; onClose: () => void; labels: ReturnType<typeof teamLabels>; onSent: () => void;
}) {
  const t = labels;
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [role, setRole] = useState<InviteRole>("builder");
  const [sending, setSending] = useState(false);

  const emailError = !email.trim()
    ? t.emailRequired
    : EMAIL_RE.test(email.trim())
      ? undefined
      : t.emailInvalid;
  const showError = touched && emailError !== undefined;

  function submit() {
    if (emailError || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onClose();
      setEmail("");
      setTouched(false);
      onSent();
    }, 900);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.invite}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t.cancel}</Button>
          <Button variant="primary" size="sm" loading={sending} disabled={!!emailError} onClick={submit}>
            {t.sendInvite}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        <Field label={t.emailLabel} htmlFor="invite-email" error={showError ? emailError : undefined} hint={t.emailHint}>
          <Input
            id="invite-email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="name@team.com"
            aria-invalid={showError || undefined}
          />
        </Field>
        <Field label={t.roleLabel} htmlFor="invite-role" hint={t.roleHint}>
          <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as InviteRole)}>
            <option value="builder">{t.roleLabels.builder}</option>
            <option value="reviewer">{t.roleLabels.reviewer}</option>
            <option value="viewer">{t.roleLabels.viewer}</option>
            <option value="admin">{t.roleLabels.admin}</option>
          </Select>
        </Field>
      </div>
    </Dialog>
  );
}

function teamLabels(isAr: boolean) {
  return isAr ? {
    desc: "من يعمل في مساحة العمل — الدور يحدد ما يمكن لكل عضو رؤيته وتعديله.",
    invite: "دعوة عضو",
    search: "ابحث بالاسم أو البريد…", searchA11y: "البحث في أعضاء الفريق",
    roleLabels: { owner: "مالك", admin: "مشرف", builder: "بانٍ", reviewer: "مراجع", viewer: "مشاهد" },
    statusLabels: { active: "نشط", pending: "بانتظار القبول", suspended: "موقوف" },
    pendingNote: "بانتظار قبول الدعوة",
    ago: { now: "نشط الآن", min: "دقيقة منذ النشاط", hour: "ساعة منذ النشاط", day: "يوم منذ النشاط" },
    emptyTitle: "لا أعضاء بعد",
    emptyBody: "ادعُ زميلك بالبريد وسيرد اسمه هنا بعد قبول الدعوة.",
    noMatchTitle: "لا نتائج مطابقة",
    noMatchBody: "جرّب اسمًا آخر أو أفرغ حقل البحث.",
    clearSearch: "إفراغ البحث",
    hint: "المالك وحده ينقل الأدوار الإدارية — وكل تغيير يُسجَّل في سجل مساحة العمل.",
    emailLabel: "البريد الإلكتروني", emailHint: "سنرسل دعوة واحدة قابلة للقبول أو الرفض.",
    emailRequired: "البريد مطلوب لإرسال الدعوة.",
    emailInvalid: "اكتب بريدًا صالحًا مثل name@team.com.",
    roleLabel: "الدور عند الانضمام", roleHint: "يمكن تعديله لاحقًا من قبل المالك.",
    cancel: "إلغاء", sendInvite: "إرسال الدعوة",
    inviteSent: "أُرسلت الدعوة — سنظهر العضو بعد قبوله.",
    errTitle: "تعذر تحميل قائمة الفريق",
    errBody: "حدث خطأ مؤقت أثناء جلب الأعضاء — أعد المحاولة.",
    retry: "إعادة المحاولة",
  } : {
    desc: "Who is in the workspace — each role decides what a member can see and change.",
    invite: "Invite a member",
    search: "Search by name or email…", searchA11y: "Search team members",
    roleLabels: { owner: "Owner", admin: "Admin", builder: "Builder", reviewer: "Reviewer", viewer: "Viewer" },
    statusLabels: { active: "Active", pending: "Pending acceptance", suspended: "Suspended" },
    pendingNote: "Waiting for the invite to be accepted",
    ago: { now: "active now", min: "min since active", hour: "h since active", day: "d since active" },
    emptyTitle: "No members yet",
    emptyBody: "Invite a teammate by email and their name will appear here once they accept.",
    noMatchTitle: "No matching results",
    noMatchBody: "Try another name or clear the search field.",
    clearSearch: "Clear search",
    hint: "Only the owner grants admin roles — and every change is recorded in the workspace log.",
    emailLabel: "Email address", emailHint: "We will send a single invite they can accept or decline.",
    emailRequired: "An email is required to send the invite.",
    emailInvalid: "Enter a valid email such as name@team.com.",
    roleLabel: "Role on joining", roleHint: "The owner can change it later.",
    cancel: "Cancel", sendInvite: "Send invite",
    inviteSent: "Invite sent — the member appears once they accept.",
    errTitle: "Couldn’t load the team",
    errBody: "A temporary error occurred while fetching members — try again.",
    retry: "Try again",
  };
}

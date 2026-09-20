"use client";

/* ============================================================
   MDS v4 — app-shell.tsx
   Desktop sidebar (rail/expanded) · mobile drawer + bottom tabs
   · ⌘K command palette · immersive chat route.
   Structure per DESIGN.md §4. No legacy classes.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Bell, Bot, BookOpen, Boxes, ChartNoAxesColumn, ChevronsLeft, CreditCard,
  FolderKanban, House, MessageCircle, Menu, PanelLeftOpen, Plus, Search,
  Settings, Users, Workflow, X, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MinsajMark, cn } from "@minsaj/ui";
import { switchLocaleInPath, type Dictionary } from "@minsaj/i18n";
import type { Locale } from "@minsaj/contracts";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type NavItem = { id: string; label: string; href: string; icon: LucideIcon };
type NavGroup = { id: string; label: string; items: NavItem[] };

export function AppShell({ children, locale, dictionary }: { children: ReactNode; locale: Locale; dictionary: Dictionary }) {
  const pathname = usePathname();
  const isAr = locale === "ar";
  const t = useMemo(() => shellLabels(isAr), [isAr]);
  const base = `/${locale}/app`;
  const nav = dictionary.nav;

  const groups: NavGroup[] = [
    {
      id: "core", label: t.core,
      items: [
        { id: "home", label: nav.home, href: `${base}/home`, icon: House },
        { id: "chat", label: nav.chat, href: `${base}/chat`, icon: MessageCircle },
      ],
    },
    {
      id: "work", label: t.work,
      items: [
        { id: "projects", label: nav.projects, href: `${base}/projects`, icon: FolderKanban },
        { id: "agents", label: nav.agents, href: `${base}/agents`, icon: Bot },
        { id: "flows", label: nav.flows, href: `${base}/flows`, icon: Workflow },
        { id: "runs", label: nav.runs, href: `${base}/runs`, icon: Zap },
      ],
    },
    {
      id: "workspace", label: t.workspace,
      items: [
        { id: "knowledge", label: nav.knowledge, href: `${base}/knowledge`, icon: BookOpen },
        { id: "models", label: nav.models, href: `${base}/models`, icon: Boxes },
        { id: "tools", label: nav.tools, href: `${base}/tools`, icon: Settings },
        { id: "skills", label: nav.skills, href: `${base}/skills`, icon: Boxes },
      ],
    },
    {
      id: "admin", label: t.admin,
      items: [
        { id: "usage", label: nav.usage, href: `${base}/usage`, icon: ChartNoAxesColumn },
        { id: "team", label: nav.team, href: `${base}/team`, icon: Users },
        { id: "billing", label: t.billing, href: `${base}/billing`, icon: CreditCard },
        { id: "settings", label: nav.settings, href: `${base}/settings`, icon: Settings },
      ],
    },
  ];
  const allItems = groups.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  const bottomItems: NavItem[] = [
    allItems[0], allItems[1], allItems[2], allItems[3],
    { id: "more", label: t.more, href: "#more", icon: Menu },
  ];

  const immersive = pathname.startsWith(`${base}/chat`);
  const [rail, setRail] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("minsaj.mds4.rail");
    if (stored === "1") setRail(true);
  }, []);
  const toggleRail = useCallback(() => {
    setRail((v) => {
      localStorage.setItem("minsaj.mds4.rail", v ? "0" : "1");
      return !v;
    });
  }, []);

  /* route change closes transient chrome */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setDrawer(false); setCmdOpen(false); }

  /* lock scroll while drawer/palette open */
  useEffect(() => {
    if (!drawer && !cmdOpen) { delete document.body.dataset.lock; return; }
    document.body.dataset.lock = "true";
    return () => { delete document.body.dataset.lock; };
  }, [drawer, cmdOpen]);

  /* ⌘K + Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen((v) => !v); }
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const altLocale: Locale = isAr ? "en" : "ar";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((i) => i.label.toLowerCase().includes(q) || i.id.includes(q));
  }, [query, allItems]);

  const SidebarNav = (
    <nav className="mj-side__nav" aria-label={t.primaryNav}>
      {groups.map((g) => (
        <div key={g.id} style={{ display: "grid", gap: 2 }}>
          <span className="mj-side__label">{g.label}</span>
          {g.items.map((item) => (
            <NavLink key={item.id} item={item} active={isActive(item.href)} rail={rail} onNavigate={() => setDrawer(false)} />
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="mj-shell" data-rail={rail ? "true" : "false"} data-drawer={drawer ? "open" : "closed"} data-chrome={immersive ? "immersive" : "full"}>
      <a className="mj-skip-link" data-audit-exclude="" href="#main-content">{t.skip}</a>

      {/* desktop sidebar */}
      <aside className="mj-side" data-rail={rail ? "true" : "false"}>
        <div className="mj-side__brand">
          <Link href={`/${locale}/app/home`} aria-label="Minsaj" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MinsajMark size={28} onDark />
            <b>{isAr ? "منسج" : "Minsaj"}</b>
          </Link>
          <button type="button" className="mj-icon-btn mj-icon-btn--sm" onClick={toggleRail} aria-label={rail ? t.expand : t.collapse} style={{ marginInlineStart: "auto" }}>
            {rail ? <PanelLeftOpen size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
        <Link href={`${base}/chat?action=new`} className="mj-btn mj-btn--primary mj-side__new">
          <Plus size={16} /><span>{t.start}</span>
        </Link>
        {SidebarNav}
        <div className="mj-side__foot">
          <Link href={`${base}/settings`} className="mj-side__user">
            <span className="mj-avatar mj-avatar--sm"><bdi>{isAr ? "س" : "S"}</bdi></span>
            <span className="mj-side__user-meta mj-grow">
              <b className="mj-body-s">{t.userName}</b>
              <small>{t.userPlan}</small>
            </span>
          </Link>
        </div>
      </aside>

      {/* mobile drawer */}
      <button type="button" className="mj-drawer-scrim" data-audit-exclude="" aria-label={t.close} onClick={() => setDrawer(false)} />
      <aside className="mj-drawer" data-audit-exclude="" aria-hidden={!drawer}>
        <div className="mj-side__brand">
          <MinsajMark size={28} onDark />
          <b>{isAr ? "منسج" : "Minsaj"}</b>
          <button type="button" className="mj-icon-btn mj-icon-btn--sm" onClick={() => setDrawer(false)} aria-label={t.close} style={{ marginInlineStart: "auto" }}><X size={16} /></button>
        </div>
        <div className="mj-side__new">{null}</div>
        {SidebarNav}
      </aside>

      {/* main column */}
      <div className="mj-main">
        <header className="mj-topbar">
          <button type="button" className="mj-icon-btn mj-topbar__menu-btn" onClick={() => setDrawer(true)} aria-label={t.openMenu} aria-expanded={drawer}><Menu size={20} /></button>
          <span className="mj-topbar__crumb mj-truncate">{activeItem ? <><b>{activeItem.label}</b></> : <b>{isAr ? "منسج" : "Minsaj"}</b>}</span>
          <div className="mj-topbar__actions">
            <button type="button" className="mj-search-trigger" onClick={() => setCmdOpen(true)}>
              <Search size={15} />
              <span>{t.search}</span>
              <span className="mj-kbd">⌘K</span>
            </button>
            <ThemeToggle locale={locale} />
            <Link href={switchLocaleInPath(pathname, altLocale)} prefetch={false} className="mj-icon-btn" aria-label={t.language}><bdi>{altLocale.toUpperCase()}</bdi></Link>
            <button type="button" className="mj-icon-btn" aria-label={t.notifications}><Bell size={17} /></button>
          </div>
        </header>

        <div className="mj-content">
          <main id="main-content">{children}</main>
        </div>
      </div>

      {/* mobile bottom tabs */}
      <nav className="mj-bottom-nav" data-audit-exclude="" aria-label={t.mobileNav} hidden={immersive}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          if (item.id === "more") {
            return (
              <button key={item.id} type="button" onClick={() => setDrawer(true)} aria-label={t.more}>
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          }
          return (
            <Link key={item.id} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* command palette */}
      <Dialog.Root open={cmdOpen} onOpenChange={setCmdOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="mj-overlay" />
          <Dialog.Content className="mj-cmd" aria-describedby={undefined}>
            <Dialog.Title className="mj-sr">{t.search}</Dialog.Title>
            <div className="mj-cmd__input">
              <Search size={18} color="var(--ink-3)" />
              <input autoFocus dir="auto" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchHint} aria-label={t.search} />
              <span className="mj-kbd">esc</span>
            </div>
            <div className="mj-cmd__list">
              {filtered.length === 0 ? <p className="mj-cmd__empty">{t.noResults}</p> : (
                <>
                  <p className="mj-cmd__group">{t.goTo}</p>
                  {filtered.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.id} href={item.href} className="mj-cmd__item" onClick={() => setCmdOpen(false)}>
                        <Icon size={16} />
                        <span className="mj-grow">{item.label}</span>
                        <span className="mj-kbd">↵</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function NavLink({ item, active, rail, onNavigate }: { item: NavItem; active: boolean; rail?: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="mj-nav-link" aria-current={active ? "page" : undefined} title={rail ? item.label : undefined} onClick={onNavigate}>
      <Icon size={18} strokeWidth={1.75} />
      <b className="mj-grow">{item.label}</b>
    </Link>
  );
}

function shellLabels(isAr: boolean) {
  return isAr ? {
    skip: "انتقل إلى المحتوى", primaryNav: "التنقل الرئيسي", mobileNav: "التنقل السفلي",
    core: "الأساس", work: "العمل", workspace: "مساحة العمل", admin: "الإدارة",
    start: "ابدأ محادثة", search: "ابحث في منسج…", searchHint: "انتقل إلى صفحة أو إجراء…",
    goTo: "الوجهات", noResults: "لا توجد نتائج مطابقة", more: "المزيد",
    openMenu: "فتح القائمة", close: "إغلاق", expand: "توسيع الشريط", collapse: "طي الشريط",
    notifications: "الإشعارات", language: "التبديل إلى الإنجليزية",
    userName: "سارة الأحمد", userPlan: "خطة الفريق", billing: "الفواتير",
  } : {
    skip: "Skip to content", primaryNav: "Primary navigation", mobileNav: "Bottom navigation",
    core: "Core", work: "Work", workspace: "Workspace", admin: "Admin",
    start: "New chat", search: "Search Minsaj…", searchHint: "Go to a page or action…",
    goTo: "Destinations", noResults: "No matching results", more: "More",
    openMenu: "Open menu", close: "Close", expand: "Expand sidebar", collapse: "Collapse sidebar",
    notifications: "Notifications", language: "Switch to Arabic",
    userName: "Sarah Alahmad", userPlan: "Team plan", billing: "Billing",
  };
}

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  Code2,
  Command,
  Compass,
  FolderKanban,
  GraduationCap,
  House,
  Library,
  Menu,
  MessageCircle,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  SearchCheck,
  Settings,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MinsajMark } from "@minsaj/ui";
import { switchLocaleInPath, type Dictionary } from "@minsaj/i18n";
import type { Locale } from "@minsaj/contracts";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useViewportMode } from "@/hooks/use-viewport-mode";

type ShellNavItem = { id: string; label: string; href: string; icon: LucideIcon };

function ShellNavLink({ item, active, onNavigate, tabIndex }: { item: ShellNavItem; active: boolean; onNavigate: () => void; tabIndex?: number }) {
  const Icon = item.icon;
  return <Link href={item.href} className={`universal-shell-link${active ? " is-active" : ""}`} title={item.label} aria-current={active ? "page" : undefined} onClick={onNavigate} tabIndex={tabIndex}><span><Icon size={18} strokeWidth={1.8} /></span><b>{item.label}</b>{item.id === "learn" ? <i /> : null}</Link>;
}

export function AppShell({ children, locale }: { children: ReactNode; locale: Locale; dictionary: Dictionary; workspaceName?: string }) {
  const pathname = usePathname();
  const viewport = useViewportMode();
  const isArabic = locale === "ar";
  const base = `/${locale}/app`;
  const [collapsed, setCollapsed] = useState(false);          // desktop user preference
  const [mobileOpen, setMobileOpen] = useState(false);        // mobile drawer
  const [overlayOpen, setOverlayOpen] = useState(false);      // tablet expand-over-content
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const advancedRegionRef = useRef<HTMLDivElement | null>(null);

  const labels = isArabic
    ? {
        forYou: "لك",
        ask: "اسأل",
        learn: "تعلّم",
        research: "ابحث",
        create: "أنشئ",
        code: "برمج",
        analyze: "حلّل",
        explore: "استكشف",
        library: "مكتبتي",
        advanced: "أدوات متقدمة",
        projects: "المشاريع",
        agents: "الوكلاء",
        flows: "التدفقات",
        knowledge: "مصادر المعرفة",
        models: "النماذج",
        settings: "الإعدادات",
        start: "ابدأ شيئًا جديدًا",
        search: "ابحث في منسج…",
        searchHint: "انتقل إلى خدمة، عمل، أو إعداد",
        noResult: "لا توجد نتيجة مطابقة",
        personal: "مساحتي",
        adaptive: "متكيفة مع أهدافك",
        demo: "نموذج تفاعلي",
        noticeTitle: "مسار تعلّمك ينتظرك",
        noticeBody: "أكملت 34% من أساسيات علم البيانات.",
        savedTitle: "تم حفظ البحث",
        savedBody: "أضيف تقرير الطاقة المتجددة إلى مكتبتك.",
        notifications: "الإشعارات",
        languageLabel: "التبديل إلى الإنجليزية",
        close: "إغلاق",
        collapse: "طي القائمة",
        expand: "توسيع القائمة",
        more: "فتح القائمة",
      }
    : {
        forYou: "For you",
        ask: "Ask",
        learn: "Learn",
        research: "Research",
        create: "Create",
        code: "Code",
        analyze: "Analyze",
        explore: "Explore",
        library: "My library",
        advanced: "Advanced tools",
        projects: "Projects",
        agents: "Agents",
        flows: "Flows",
        knowledge: "Knowledge sources",
        models: "Models",
        settings: "Settings",
        start: "Start something new",
        search: "Search Minsaj…",
        searchHint: "Go to a service, item, or setting",
        noResult: "No matching result",
        personal: "My space",
        adaptive: "Adaptive to your goals",
        demo: "Interactive prototype",
        noticeTitle: "Your learning path is waiting",
        noticeBody: "You are 34% through data science foundations.",
        savedTitle: "Research saved",
        savedBody: "The renewable energy report is now in your library.",
        notifications: "Notifications",
        languageLabel: "Switch to Arabic",
        close: "Close",
        collapse: "Collapse navigation",
        expand: "Expand navigation",
        more: "Open menu",
      };

  const primaryItems = [
    { id: "home", label: labels.forYou, href: `${base}/home`, icon: House },
    { id: "chat", label: labels.ask, href: `${base}/chat`, icon: MessageCircle },
    { id: "learn", label: labels.learn, href: `${base}/learn`, icon: GraduationCap },
    { id: "research", label: labels.research, href: `${base}/research`, icon: SearchCheck },
    { id: "create", label: labels.create, href: `${base}/create`, icon: Palette },
    { id: "code", label: labels.code, href: `${base}/code`, icon: Code2 },
    { id: "analyze", label: labels.analyze, href: `${base}/analyze`, icon: ChartNoAxesCombined },
    { id: "explore", label: labels.explore, href: `${base}/explore`, icon: Compass },
  ] as const;
  const advancedItems = [
    { id: "projects", label: labels.projects, href: `${base}/projects`, icon: FolderKanban },
    { id: "agents", label: labels.agents, href: `${base}/agents`, icon: Bot },
    { id: "flows", label: labels.flows, href: `${base}/flows`, icon: Workflow },
    { id: "knowledge", label: labels.knowledge, href: `${base}/knowledge`, icon: BookOpen },
    { id: "models", label: labels.models, href: `${base}/models`, icon: Boxes },
  ] as const;
  const utilityItems = [
    { id: "library", label: labels.library, href: `${base}/library`, icon: Library },
    { id: "settings", label: labels.settings, href: `${base}/settings`, icon: Settings },
  ] as const;
  const allItems = [...primaryItems, ...utilityItems, ...advancedItems];
  const normalized = query.trim().toLocaleLowerCase(locale);
  const filtered = normalized ? allItems.filter((item) => item.label.toLocaleLowerCase(locale).includes(normalized)) : allItems;
  const activeItem = allItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const alternateLocale: Locale = isArabic ? "en" : "ar";

  /* ------------------------------------------------------------------
     MIDS-v3 §4 — IMMERSIVE ROUTES
     Routes whose content owns the bottom band (chat composer) never
     share it with the fixed bottom nav: the nav hides and returns its
     reserved space. Measured defect this cures: composer fully
     occluded by all 5 nav links (69×49px overlap at 360/390/414px).
     ------------------------------------------------------------------ */
  const immersiveRoute = pathname.startsWith(`${base}/chat`);
  const chrome = immersiveRoute ? "immersive" : "full";

  /* ------------------------------------------------------------------
     Sidebar state machine — one source of truth shared with shell.css
       mobile  → "drawer"   (off-canvas + overlay + bottom tab bar)
       tablet  → overlayOpen ? "expanded"(overlay) : "rail"
       desktop → collapsed ? "rail" : "expanded"
     ------------------------------------------------------------------ */
  const sidebarMode =
    viewport === "mobile" ? "drawer"
    : viewport === "tablet" ? (overlayOpen ? "expanded" : "rail")
    : viewport === null ? "drawer" /* SSR first paint: mobile-safe */
    : (collapsed ? "rail" : "expanded");
  const isOverlay = viewport === "tablet" && overlayOpen;
  const isDrawer = sidebarMode === "drawer";
  const sidebarOpen = mobileOpen || isOverlay;
  const railActive = sidebarMode === "rail";

  /* Restore desktop collapse preference (deferred — external system read) */
  useEffect(() => {
    const stored = window.localStorage.getItem("minsaj.universal.sidebar");
    if (stored !== "collapsed") return;
    const restoreFrame = window.requestAnimationFrame(() => setCollapsed(true));
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  /* Reset transient states when the viewport band or route changes.
     Official React "reset state on change" pattern — comparing against the
     last-seen value stored in state, no effects, no cascading renders. */
  const [lastRoute, setLastRoute] = useState(pathname);
  if (lastRoute !== pathname) {
    setLastRoute(pathname);
    setMobileOpen(false);
    setOverlayOpen(false);
  }
  const [lastViewport, setLastViewport] = useState(viewport);
  if (lastViewport !== viewport) {
    setLastViewport(viewport);
    setMobileOpen(false);
    setOverlayOpen(false);
  }

  /* Scroll lock while drawer / overlay / dialogs are open */
  useEffect(() => {
    const lock = sidebarOpen || commandOpen;
    if (!lock) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [sidebarOpen, commandOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOverlayOpen(false);
        setNotificationsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleAdvanced() {
    setAdvancedOpen((value) => !value);
  }

  /* Keep newly revealed advanced items in view — the nav scrolls internally,
     so expansion could otherwise land below the fold on short viewports. */
  useEffect(() => {
    if (!advancedOpen) return;
    const frame = window.requestAnimationFrame(() => {
      advancedRegionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [advancedOpen]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function closeTransient() {
    setMobileOpen(false);
    setOverlayOpen(false);
    setCommandOpen(false);
    setNotificationsOpen(false);
  }

  function toggleSidebar() {
    if (viewport === "mobile") { setMobileOpen((value) => !value); return; }
    if (viewport === "tablet") { setOverlayOpen((value) => !value); return; }
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("minsaj.universal.sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <Dialog.Root open={commandOpen} onOpenChange={setCommandOpen}>
      <div className="universal-app-shell" data-sidebar={sidebarMode} data-overlay={isOverlay ? "true" : "false"} data-mobile-open={mobileOpen} data-chrome={chrome}>
        <a className="skip-link" href="#main-content">{isArabic ? "انتقل إلى المحتوى" : "Skip to content"}</a>

        <button type="button" className="universal-shell-backdrop" data-state={sidebarOpen ? "open" : "closed"} onClick={() => { setMobileOpen(false); setOverlayOpen(false); }} aria-label={labels.close} aria-hidden={!sidebarOpen} tabIndex={sidebarOpen ? 0 : -1} />

        <aside id="universal-shell-sidebar" className="universal-shell-sidebar" aria-label={isArabic ? "التنقل الرئيسي" : "Primary navigation"}>
          <div className="universal-shell-brand-row">
            <Link href={`/${locale}/app/home`} className="universal-shell-brand"><span><MinsajMark size={34} onDark /></span><b>{isArabic ? "منسج" : "Minsaj"}</b><Sparkles size={12} /></Link>
            <button type="button" className="universal-shell-collapse" onClick={toggleSidebar} aria-label={railActive ? labels.expand : labels.collapse} title={railActive ? labels.expand : labels.collapse}>{railActive ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
            <button type="button" className="universal-shell-close" onClick={() => setMobileOpen(false)} aria-label={labels.close}><X size={18} /></button>
          </div>

          <Link href={`${base}/home`} className="universal-shell-new" onClick={closeTransient} title={labels.start}><span><Plus size={18} /></span><b>{labels.start}</b></Link>

          <nav className="universal-shell-nav">
            <div className="universal-shell-nav__main">{primaryItems.map((item) => <ShellNavLink item={item} active={isActive(item.href)} onNavigate={closeTransient} key={item.id} />)}</div>
            <div className="universal-shell-nav__utility"><ShellNavLink item={utilityItems[0]} active={isActive(utilityItems[0].href)} onNavigate={closeTransient} />
              <button type="button" className={`universal-shell-advanced${advancedOpen ? " is-open" : ""}`} onClick={toggleAdvanced} aria-expanded={advancedOpen} aria-controls="universal-advanced-nav" title={labels.advanced}><span><Sparkles size={18} /></span><b>{labels.advanced}</b><ChevronDown size={14} /></button>
              <div id="universal-advanced-nav" ref={advancedRegionRef} className="universal-shell-advanced-region" data-state={advancedOpen ? "open" : "closed"} aria-hidden={!advancedOpen}>
                <div className="universal-shell-advanced-list">{advancedItems.map((item) => <ShellNavLink item={item} active={isActive(item.href)} onNavigate={closeTransient} tabIndex={advancedOpen ? 0 : -1} key={item.id} />)}</div>
              </div>
            </div>
          </nav>

          <div className="universal-shell-profile">
            <Link href={`${base}/settings`} onClick={closeTransient} title={labels.settings}><span className="universal-shell-avatar">ن</span><span><strong>{labels.personal}</strong><small>{labels.adaptive}</small></span><Settings size={16} /></Link>
          </div>
        </aside>

        <div className="universal-shell-main">
          <header className="universal-shell-topbar">
            <div className="universal-shell-context">
              <button type="button" onClick={toggleSidebar} aria-label={isDrawer ? labels.more : (railActive ? labels.expand : labels.collapse)} aria-expanded={sidebarOpen} aria-controls="universal-shell-sidebar"><Menu size={20} /></button>
              <span>{activeItem?.label ?? labels.forYou}</span>
              {activeItem?.id === "home" ? <small><Sparkles size={12} />{labels.adaptive}</small> : null}
            </div>
            <Dialog.Trigger asChild><button type="button" className="universal-shell-search"><Search size={16} /><span>{labels.search}</span><kbd>⌘K</kbd></button></Dialog.Trigger>
            <div className="universal-shell-actions"><span className="universal-shell-demo"><i />{labels.demo}</span><ThemeToggle locale={locale} /><Link href={switchLocaleInPath(pathname, alternateLocale)} prefetch={false} aria-label={labels.languageLabel}>{alternateLocale.toUpperCase()}</Link><button type="button" onClick={() => setNotificationsOpen((value) => !value)} aria-expanded={notificationsOpen} aria-controls="universal-notifications" aria-label={labels.notifications}><Bell size={18} /><i /></button><Link href={`${base}/settings`} className="universal-top-avatar">ن</Link></div>
          </header>

          <aside id="universal-notifications" className="universal-notifications" data-state={notificationsOpen ? "open" : "closed"} role="dialog" aria-label={labels.notifications} aria-hidden={!notificationsOpen}><header><div><span>{labels.notifications}</span><small>2</small></div><button type="button" tabIndex={notificationsOpen ? 0 : -1} onClick={() => setNotificationsOpen(false)} aria-label={labels.close}><X size={18} /></button></header><Link href={`${base}/learn`} tabIndex={notificationsOpen ? 0 : -1} onClick={closeTransient}><span><GraduationCap size={18} /></span><div><strong>{labels.noticeTitle}</strong><p>{labels.noticeBody}</p></div></Link><Link href={`${base}/library`} tabIndex={notificationsOpen ? 0 : -1} onClick={closeTransient}><span><CheckCircle2 size={18} /></span><div><strong>{labels.savedTitle}</strong><p>{labels.savedBody}</p></div></Link></aside>

          <main id="main-content" className="universal-shell-content"><div className="universal-route-frame mj-flow" key={pathname}>{children}</div></main>
        </div>

        <nav className="universal-shell-mobile-nav" aria-label={isArabic ? "التنقل على الهاتف" : "Mobile navigation"} hidden={immersiveRoute}>
          {[primaryItems[0], primaryItems[1], primaryItems[4], primaryItems[7], utilityItems[0]].map((item) => { const Icon = item.icon; return <Link href={item.href} className={isActive(item.href) ? "is-active" : ""} aria-current={isActive(item.href) ? "page" : undefined} key={item.id}><Icon size={18} /><span>{item.label}</span></Link>; })}
        </nav>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="universal-command-overlay" />
        <Dialog.Content className="universal-command" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{labels.search}</Dialog.Title>
          <div className="universal-command__input"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchHint} aria-label={labels.searchHint} /><Dialog.Close asChild><button type="button" aria-label={labels.close}><X size={18} /></button></Dialog.Close></div>
          <div className="universal-command__results"><span>{isArabic ? "الخدمات والوجهات" : "Services and destinations"}</span>{filtered.length ? filtered.map((item) => { const Icon = item.icon; return <Link href={item.href} onClick={closeTransient} key={item.id}><span><Icon size={18} /></span><b>{item.label}</b><Command size={14} /></Link>; }) : <p>{labels.noResult}</p>}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

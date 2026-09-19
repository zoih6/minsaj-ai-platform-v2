import type { ReactNode, SVGProps } from "react";

/* ==================================================================
   MINSaj ICON LANGUAGE — the domain icon system.
   ------------------------------------------------------------------
   Rules (design/icons/ICON-SYSTEM.md is the source of truth):
   - 24×24 grid · stroke 2 · round caps & joins · fill none
   - Optical harmony with the retained Lucide utility glyphs
   - Weaving DNA: threads that cross, node dots, woven negative space
   - Sizes live on the closed ladder: 12/14/16/18/20/24
   ================================================================== */

type IconProps = SVGProps<SVGSVGElement> & { size?: 12 | 14 | 16 | 18 | 20 | 24 };

function Base({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
      {...props}
    >
      {children}
    </svg>
  );
}

const dot = "M0 0h.01";

/* ---- AI / Intelligence: four-point spark over woven threads ---- */
export function IconSpark(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7Z" />
      <path d="M4.5 18.5c2.5 1.6 4.5-1.6 7.5 0s5-1.6 7.5 0" opacity={0.55} />
      <path d="M18.6 4.2h.01" />
    </Base>
  );
}

/* ---- Agents: knot head, node antenna ---- */
export function IconAgent(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4.5" y="8.5" width="15" height="10.5" rx="3.4" />
      <path d="M12 8.5V6.2" />
      <path d="M9.4 5.4 12 6.2l2.6-.8" />
      <path d="M9.3 13h.01M14.7 13h.01" />
      <path d="M9.5 16.2c1.5 1 3.5 1 5 0" opacity={0.55} />
    </Base>
  );
}

/* ---- Models: stacked layers with a thread through ---- */
export function IconModel(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5 20 7.5 12 11.5 4 7.5Z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16.5l8 4 8-4" opacity={0.55} />
    </Base>
  );
}

/* ---- Workflows: four nodes, crossing threads ---- */
export function IconFlow(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="5.5" cy="5.5" r="2" />
      <circle cx="18.5" cy="5.5" r="2" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
      <path d="M7.5 7.2 16.5 16.8" />
      <path d="M7.5 16.8 16.5 7.2" opacity={0.55} />
    </Base>
  );
}

/* ---- Automation: circular flow, two nodes ---- */
export function IconAutomation(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M19.5 12a7.5 7.5 0 1 1-3.2-6.15" />
      <path d="M19.7 3.8v3.4h-3.4" />
      <path d="M12 9.8h.01" />
      <path d="M12 14.2h.01" opacity={0.55} />
    </Base>
  );
}

/* ---- Integrations: interlocked links ---- */
export function IconIntegration(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10.4 13.6a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5" />
      <path d="M13.6 10.4a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5" />
    </Base>
  );
}

/* ---- Knowledge: open book, woven spine ---- */
export function IconKnowledge(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 6.2C10.2 4.8 7.6 4.2 4.2 4.2v13.6c3.4 0 6 .6 7.8 2 1.8-1.4 4.4-2 7.8-2V4.2c-3.4 0-6 .6-7.8 2Z" />
      <path d="M12 6.2v13.6" />
      <path d="M7.2 9.4h.01M16.8 9.4h.01" opacity={0.55} />
    </Base>
  );
}

/* ---- API: brackets, thread between ---- */
export function IconApi(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8.5 4H6.4A2.4 2.4 0 0 0 4 6.4v3.1" />
      <path d="M4 14.5v3.1A2.4 2.4 0 0 0 6.4 20h2.1" />
      <path d="M15.5 4h2.1A2.4 2.4 0 0 1 20 6.4v3.1" />
      <path d="M20 14.5v3.1a2.4 2.4 0 0 1-2.4 2.4h-2.1" />
      <path d="M9.5 12h5" opacity={0.55} />
      <path d="M12 10.8v2.4" opacity={0.55} />
    </Base>
  );
}

/* ---- Chat: bubble with woven dots ---- */
export function IconChat(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5c5 0 8.8 3.4 8.8 7.7 0 4.4-3.8 7.8-8.8 7.8-1 0-2-.1-2.9-.4L4.2 20l1.4-3.4c-1.5-1.4-2.4-3.3-2.4-5.4C3.2 6.9 7 3.5 12 3.5Z" />
      <path d="M8.3 11.2h.01M12 11.2h.01M15.7 11.2h.01" />
    </Base>
  );
}

/* ---- Search: lens with node ---- */
export function IconSearch(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.4" />
      <path d="M15.8 15.8 20.5 20.5" />
      <path d="M11 11h.01" opacity={0.55} />
    </Base>
  );
}

/* ---- Analytics: baseline, bars, trend thread ---- */
export function IconAnalytics(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20h16" />
      <path d="M7 20v-5.5M11.5 20V11M16 20v-7" />
      <path d="M5.5 11.5 10.8 7l4 2.2L19.5 4.5" opacity={0.55} />
    </Base>
  );
}

/* ---- Projects: folder, woven thread inside ---- */
export function IconProjects(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3.8 7.2a2 2 0 0 1 2-2h3.9l2 2.4h6.5a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2Z" />
      <path d="M8.2 14.6c1.3-1.4 2.6 1.4 3.9 0s2.6 1.4 3.9 0" opacity={0.55} />
    </Base>
  );
}

/* ---- Files: document, content lines ---- */
export function IconFiles(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M13.8 3.5H7.4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9.2a2 2 0 0 0 2-2V8.3Z" />
      <path d="M13.8 3.5v4.8h4.8" />
      <path d="M9 13.2h6M9 16.6h4" opacity={0.55} />
    </Base>
  );
}

/* ---- Settings: threaded sliders ---- */
export function IconSettings(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h8.4M17.6 7H20" />
      <circle cx="15" cy="7" r="2.2" />
      <path d="M4 12h2.4M11.6 12H20" />
      <circle cx="9" cy="12" r="2.2" />
      <path d="M4 17h10.4M19.6 17H20" />
      <circle cx="17" cy="17" r="2.2" />
    </Base>
  );
}

/* ---- Security: shield, woven check ---- */
export function IconSecurity(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.2 19.5 6v5.6c0 4.6-3.2 7.7-7.5 9.4-4.3-1.7-7.5-4.8-7.5-9.4V6Z" />
      <path d="M9.3 11.8l2 2 3.6-3.8" />
    </Base>
  );
}

/* ---- Users: two people, woven ---- */
export function IconUsers(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="9.2" cy="8.4" r="3.2" />
      <path d="M3.6 19.4c.6-3 2.9-4.8 5.6-4.8s5 1.8 5.6 4.8" />
      <path d="M15.4 5.6a3.2 3.2 0 0 1 0 5.6" />
      <path d="M16.8 14.9c2.1.5 3.4 2 3.8 4.3" opacity={0.55} />
    </Base>
  );
}

/* ---- Notifications: bell, node clapper ---- */
export function IconNotifications(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 9.4a6 6 0 1 0-12 0c0 5.2-2.2 6.4-2.2 6.4h16.4S18 14.6 18 9.4Z" />
      <path d="M10.2 19.4a2 2 0 0 0 3.6 0" />
    </Base>
  );
}

/* ---- Billing: card, thread, node ---- */
export function IconBilling(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.2" y="6" width="17.6" height="12.5" rx="2.4" />
      <path d="M3.2 10.4h17.6" />
      <path d="M7 14.6h3.4" opacity={0.55} />
      <path d="M16.2 14.6h.01" />
    </Base>
  );
}

/* ---- Dashboard: quad grid, one woven tile ---- */
export function IconDashboard(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.8" />
      <path d="M14.8 16.5h3.4M16.5 14.8v3.4" opacity={0.55} />
      <rect x="13" y="13" width="7" height="7" rx="1.8" />
    </Base>
  );
}

/* ---- Library: three spines ---- */
export function IconLibrary(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.8 4.5h2.6v15H6.8Z" />
      <path d="M11.6 4.5h2.6v15h-2.6Z" />
      <path d="M16.6 5.6l2.5.7-3 13.7-2.5-.7Z" opacity={0.55} />
    </Base>
  );
}

/* ---- Tools: wrench, node ---- */
export function IconTools(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14.8 6.2a4 4 0 0 0-5.4 4.9L4.2 16.3V20h3.7l5.2-5.2a4 4 0 0 0 4.9-5.4l-2.5 2.5-2.5-.6-.6-2.5Z" />
    </Base>
  );
}

/* ---- Skills: spark in orbit ---- */
export function IconSkills(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.4" opacity={0.55} />
      <path d="M12 8l1.1 2.9L16 12l-2.9 1.1L12 16l-1.1-2.9L8 12l2.9-1.1Z" />
    </Base>
  );
}

/* ---- Runs: play ring ---- */
export function IconRuns(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M10.2 8.9v6.2l5.3-3.1Z" />
    </Base>
  );
}

/* ---- Usage: gauge, needle ---- */
export function IconUsage(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5.2 18.6a8.6 8.6 0 1 1 13.6 0" />
      <path d="M12 13.6l3.4-4.2" />
      <path d="M12 13.6h.01" />
    </Base>
  );
}

/* ---- Explore: compass rose, thread ---- */
export function IconExplore(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M14.8 9.2 13 13l-3.8 1.8L11 11Z" />
    </Base>
  );
}

/* ---- Weave (the house motif): mini knot ---- */
export function IconWeave(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8.4 5.4c0 3.4-4.8 4.8-4.8 8.4a4.8 4.8 0 0 0 4.8 4.8c3.6 0 4.8-4.8 8.4-4.8" />
      <path d="M15.6 18.6c0-3.4 4.8-4.8 4.8-8.4a4.8 4.8 0 0 0-4.8-4.8c-3.6 0-4.8 4.8-8.4 4.8" opacity={0.55} />
    </Base>
  );
}

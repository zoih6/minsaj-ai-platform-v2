"use client";

/* ============================================================
   MDS v4 — page-kit.tsx
   Page anatomy: PageHeader (+ selvage), Toolbar, StatTile,
   SectionHead, ListRow, PageShell. See DESIGN.md §4-5.
   ============================================================ */

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@minsaj/ui";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mj-page", className)}>{children}</div>;
}

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mj-page-header">
      <div className="mj-page-header__row">
        <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
          <h1 className="mj-title-xl mj-clamp-2">{title}</h1>
          {description ? <p className="mj-page-header__desc">{description}</p> : null}
        </div>
        {actions ? <div className="mj-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mj-toolbar">{children}</div>;
}

export function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mj-section-head">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

export function ViewAll({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="mj-link">{label}</Link>;
}

export function StatTile({
  label, value, meta, icon,
}: { label: string; value: string; meta?: string; icon?: ReactNode }) {
  return (
    <div className="mj-card mj-stat">
      <span className="mj-stat__label">{icon}{label}</span>
      <strong className="mj-stat__value">{value}</strong>
      {meta ? <span className="mj-stat__meta">{meta}</span> : null}
    </div>
  );
}

/* one-line list row — icon/avatar + title/desc + trailing meta */
export function ListRow({
  href, leading, title, desc, trailing, onClick,
}: {
  href?: string; leading?: ReactNode; title: ReactNode; desc?: ReactNode;
  trailing?: ReactNode; onClick?: () => void;
}) {
  const inner = (
    <>
      {leading}
      <span className="mj-grow" style={{ display: "grid", gap: 2, textAlign: "start" }}>
        <span className="mj-label mj-clamp-2" style={{ color: "var(--ink)" }}>{title}</span>
        {desc ? <span className="mj-caption mj-clamp-2">{desc}</span> : null}
      </span>
      {trailing ? <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 8 }}>{trailing}</span> : null}
    </>
  );
  if (href) {
    return <Link href={href} className="mj-list-row">{inner}</Link>;
  }
  if (onClick) {
    return <button type="button" className="mj-list-row" style={{ width: "100%" }} onClick={onClick}>{inner}</button>;
  }
  return <div className="mj-list-row">{inner}</div>;
}

/* money formatter — tabular, direction-safe */
export function MoneyView({ amountMinor, currency, locale }: { amountMinor: number; currency: string; locale: string }) {
  const value = amountMinor / 100;
  const text = value.toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency", currency, maximumFractionDigits: 2,
  });
  return <span dir="ltr" className="mj-mono">{text}</span>;
}

export function TimeAgo({ iso, locale, labels }: { iso: string; locale: string; labels: { now: string; min: string; hour: string; day: string } }) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  const text =
    mins < 2 ? labels.now :
    mins < 60 ? `${mins} ${labels.min}` :
    mins < 1440 ? `${Math.round(mins / 60)} ${labels.hour}` :
    `${Math.round(mins / 1440)} ${labels.day}`;
  return <span className="mj-caption">{text}</span>;
}

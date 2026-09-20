"use client";

/* ============================================================
   MDS v4 — primitives.tsx
   The component library. Every component consumes mj-* CSS
   classes (see DESIGN.md §5). No raw visual values here.
   ============================================================ */

import {
  createContext, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { cn } from "@minsaj/ui";
import { AlertCircle, Check, Loader2, Search, X } from "lucide-react";

/* ------------------------------------------------------------------
   Button — variants × sizes × states (hover/focus/active/disabled/loading)
   ------------------------------------------------------------------ */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  variant = "secondary", size = "md", loading = false, block = false,
  className, children, disabled, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; block?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "mj-btn",
        `mj-btn--${variant}`,
        size !== "md" && `mj-btn--${size}`,
        block && "mj-btn--block",
        className,
      )}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label, size = "md", className, children, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn("mj-icon-btn", size === "sm" && "mj-icon-btn--sm", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="mj-kbd">{children}</kbd>;
}

/* ------------------------------------------------------------------
   Form fields — validate on blur (parent-controlled), error + hint slots
   ------------------------------------------------------------------ */
export function Field({
  label, hint, error, htmlFor, children,
}: { label: string; hint?: string; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="mj-field" data-error={error ? "true" : undefined}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error
        ? <p className="mj-field__error" role="alert"><AlertCircle size={14} />{error}</p>
        : hint ? <p className="mj-field__hint">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("mj-input", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("mj-textarea", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("mj-select", className)} {...props}>
      {children}
    </select>
  );
}

export function SearchInput({
  value, onChange, placeholder, ariaLabel,
}: { value: string; onChange: (v: string) => void; placeholder: string; ariaLabel: string }) {
  return (
    <div className="mj-search">
      <Search size={16} aria-hidden />
      <input
        className="mj-input"
        dir="auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        type="search"
      />
    </div>
  );
}

export function Switch({
  checked, onCheckedChange, label,
}: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="mj-switch"
      onClick={() => onCheckedChange(!checked)}
    />
  );
}

export function Checkbox({
  checked, onCheckedChange, label,
}: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className="mj-checkbox"
      data-checked={checked ? "true" : "false"}
      onClick={() => onCheckedChange(!checked)}
    >{checked ? <Check size={0} /> : null}</button>
  );
}

/* ------------------------------------------------------------------
   Surfaces
   ------------------------------------------------------------------ */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mj-card", className)} {...props}>{children}</div>;
}

export function Well({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mj-well", className)}>{children}</div>;
}

export function Avatar({
  src, alt, fallback, size = "md",
}: { src?: string; alt?: string; fallback: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("mj-avatar", size === "sm" && "mj-avatar--sm", src && "mj-avatar--img")}>
      {src ? <img src={src} alt={alt ?? ""} width={34} height={34} /> : <bdi>{fallback}</bdi>}
    </span>
  );
}

/* ------------------------------------------------------------------
   Badges & status
   ------------------------------------------------------------------ */
type Tone = "neutral" | "success" | "warning" | "danger" | "accent" | "outline";
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn("mj-badge", `mj-badge--${tone}`, className)}>{children}</span>;
}

export function Dot({ tone, pulse }: { tone?: "success" | "warning" | "danger" | "accent"; pulse?: boolean }) {
  return <span className={cn("mj-dot", tone && `mj-dot--${tone}`, pulse && "mj-dot--pulse")} />;
}

/* ------------------------------------------------------------------
   Tabs (underline, controlled) + SegmentedControl (pill)
   ------------------------------------------------------------------ */
export function Tabs({
  tabs, value, onChange, ariaLabel,
}: {
  tabs: { id: string; label: string; icon?: ReactNode; badge?: string }[];
  value: string; onChange: (id: string) => void; ariaLabel: string;
}) {
  return (
    <div className="mj-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          className="mj-tab"
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          {t.label}
          {t.badge ? <span className="mj-badge mj-badge--neutral">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Segmented({
  options, value, onChange, ariaLabel,
}: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; ariaLabel: string }) {
  return (
    <div className="mj-seg" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          className="mj-seg__btn"
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Loading primitives
   ------------------------------------------------------------------ */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("mj-skel", className)} aria-hidden />;
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  return <Loader2 className={cn("mj-spinner", size === "sm" && "mj-spinner--sm")} size={18} aria-hidden />;
}

export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="mj-progress" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="mj-progress__bar" style={{ inlineSize: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------
   Empty / Error — state-coverage craft: headline + explanation + action
   ------------------------------------------------------------------ */
export function EmptyState({
  icon, title, body, action,
}: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mj-state">
      <span className="mj-state__icon" aria-hidden>{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title, body, onRetry, retryLabel,
}: { title: string; body: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="mj-state mj-state--error" role="alert">
      <span className="mj-state__icon" aria-hidden><AlertCircle size={20} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
      {onRetry ? <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button> : null}
    </div>
  );
}

/* ------------------------------------------------------------------
   Skeleton lists — the loading state for tables/cards
   ------------------------------------------------------------------ */
export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mj-list" aria-busy="true" aria-label="loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mj-list-row" style={{ opacity: 1 - i * 0.08 }}>
          <Skeleton className="mj-avatar" />
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            <Skeleton style={{ width: `${52 - i * 4}%`, height: 12 } as React.CSSProperties} />
            <Skeleton style={{ width: `${34 + i * 5}%`, height: 10 } as React.CSSProperties} />
          </div>
          <Skeleton style={{ width: 72, height: 20, borderRadius: 999 } as React.CSSProperties} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Toast — region exists in DOM before content (ARIA craft)
   ------------------------------------------------------------------ */
type ToastMsg = { id: number; text: string };
const ToastCtx = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const push = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  return (
    <ToastCtx value={push}>
      {children}
      <div className="mj-toast-region" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className="mj-toast">{t.text}</div>)}
      </div>
    </ToastCtx>
  );
}

/* ------------------------------------------------------------------
   Dialog — Escape closes, scrim click closes, focus trapped by Radix
   ------------------------------------------------------------------ */
export function Dialog({
  open, onClose, title, children, footer, wide,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.dataset.lock = "true";
    return () => { window.removeEventListener("keydown", onKey); delete document.body.dataset.lock; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="mj-overlay" onClick={onClose} aria-hidden />
      <div className="mj-dialog" role="dialog" aria-modal="true" aria-label={title} style={wide ? { maxWidth: "min(94vw, 720px)" } : undefined}>
        <div className="mj-dialog__head">
          <h3 className="mj-title-m">{title}</h3>
          <IconButton label="close" size="sm" onClick={onClose} style={{ marginInlineStart: "auto" }}><X size={16} /></IconButton>
        </div>
        <div className="mj-dialog__body">{children}</div>
        {footer ? <div className="mj-dialog__foot">{footer}</div> : null}
      </div>
    </>
  );
}

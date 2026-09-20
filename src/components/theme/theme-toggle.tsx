"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import type { Locale } from "@minsaj/contracts";

/**
 * Theme cycle button — light → dark → system → light.
 *
 * Three-state pattern (research: clagnut.com "Three-option colour scheme
 * chooser"; lea.verou tri-state discussion): a single compact control that
 * always exposes the user's explicit choice AND the follow-system option.
 *
 * Hydration contract: first paint (SSR + first client render) renders a
 * static placeholder identical on both sides; the real icon/label is only
 * applied after mount via effect-driven state, so no hydration mismatch
 * is possible (same lesson as the v6 ScrollFx fix).
 */

type Mode = "light" | "dark" | "system";

const NEXT_MODE: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" };

const ICONS: Record<Mode, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

const LABELS: Record<Locale, Record<Mode, { current: string; next: string }>> = {
  ar: {
    light: { current: "الوضع الفاتح", next: "التبديل إلى الوضع الداكن" },
    dark: { current: "الوضع الداكن", next: "التبديل إلى وضع النظام" },
    system: { current: "وضع النظام", next: "التبديل إلى الوضع الفاتح" },
  },
  en: {
    light: { current: "Light mode", next: "Switch to dark mode" },
    dark: { current: "Dark mode", next: "Switch to system mode" },
    system: { current: "System mode", next: "Switch to light mode" },
  },
};

/**
 * Hydration-safe "is mounted" signal without effects — the React-sanctioned
 * useSyncExternalStore pattern (server snapshot false, client snapshot true).
 * Same discipline as the v6 ScrollFx fix: first client render must equal SSR.
 */
const emptySubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export function ThemeToggle({ locale, className = "mj-theme-toggle" }: { locale: Locale; className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();

  const current: Mode = mounted && (theme === "dark" || theme === "system") ? theme : "light";
  const next = NEXT_MODE[current];
  const Icon = ICONS[current];
  const text = LABELS[locale][current];

  return (
    <button
      type="button"
      className={className}
      onClick={() => setTheme(next)}
      aria-label={mounted ? text.next : locale === "ar" ? "تبديل الثيم" : "Toggle theme"}
      title={mounted ? `${text.current} — ${text.next}` : undefined}
    >
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
